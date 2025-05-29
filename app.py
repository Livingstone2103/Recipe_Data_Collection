from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import JSON
from flask_cors import CORS
import json
import urllib.parse
from sqlalchemy import text

app = Flask(__name__,
            static_url_path='',
            static_folder='static',
            template_folder='templates')

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///recipes.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
CORS(app)  # Enable CORS for all routes
db = SQLAlchemy(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/index.html')
def index_html():
    return render_template('index.html')

class Recipe(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    cuisine = db.Column(db.String(100))
    title = db.Column(db.String(200))
    rating = db.Column(db.Float)
    prep_time = db.Column(db.Integer)
    cook_time = db.Column(db.Integer)
    total_time = db.Column(db.Integer)
    description = db.Column(db.Text)
    nutrients = db.Column(JSON)
    serves = db.Column(db.String(50))

    def to_dict(self):
        # Convert None values to null
        nutrients = self.nutrients or {}
        return {
            'id': self.id,
            'title': self.title or '',
            'cuisine': self.cuisine or '',
            'rating': self.rating,
            'prep_time': self.prep_time,
            'cook_time': self.cook_time,
            'total_time': self.total_time,
            'description': self.description or '',
            'nutrients': nutrients,
            'serves': self.serves or ''
        }

@app.route('/api/recipes', methods=['GET'])
def get_recipes():
    try:
        # Handle pagination
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        
        # Build query
        query = Recipe.query.order_by(Recipe.id.asc())  # Sort by ID in ascending order
        
        # Apply pagination
        paginated = query.paginate(page=page, per_page=limit, error_out=False)
        
        print(f"Total recipes found: {paginated.total}")
        print(f"Page: {page}, Limit: {limit}")
        
        # Get data with IDs
        data = []
        for recipe in paginated.items:
            recipe_dict = recipe.to_dict()
            data.append(recipe_dict)
            print(f"Adding recipe: {recipe.id} - {recipe.title}")
        
        return jsonify({
            'page': page,
            'limit': limit,
            'total': paginated.total,
            'data': data
        })
    except Exception as e:
        print(f"Error in get_recipes: {str(e)}")
        return jsonify({'error': 'Failed to fetch recipes'}), 500

@app.route('/api/recipes/search', methods=['GET'])
def search_recipes():
    try:
        # Log search parameters
        print(f"Search parameters: {dict(request.args)}")
        
        # Handle pagination
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 15, type=int)  # Default to 15 results per page
        print(f"Pagination: page={page}, limit={limit}")
        
        # Build base query
        query = Recipe.query
        print(f"Base query: {str(query)}")
        
        # Handle numeric filters with comparison operators
        numeric_fields = ['total_time', 'rating']
        for field in numeric_fields:
            value = request.args.get(field)
            if value:
                print(f"Processing {field} filter: {value}")
                # Clean up the value by removing spaces and extracting operator
                value = urllib.parse.unquote_plus(value)  # Use unquote_plus for better handling
                value = value.strip()
                
                # Extract operator and value
                if '<=' in value:
                    operator, value = '<=', value.replace('<=', '')
                elif '>=' in value:
                    operator, value = '>=', value.replace('>=', '')
                elif '<' in value:
                    operator, value = '<', value.replace('<', '')
                elif '>' in value:
                    operator, value = '>', value.replace('>', '')
                else:
                    operator, value = '==', value
                print(f"Extracted {field} operator: {operator}, value: {value}")
                    
                # Convert to float after extracting operator
                try:
                    value = float(value.strip())
                    print(f"Converted {field} value: {value}")
                    # Apply filter based on operator
                    if operator == '<=':
                        query = query.filter(getattr(Recipe, field) <= value)
                    elif operator == '>=':
                        query = query.filter(getattr(Recipe, field) >= value)
                    elif operator == '<':
                        query = query.filter(getattr(Recipe, field) < value)
                    elif operator == '>':
                        query = query.filter(getattr(Recipe, field) > value)
                    else:
                        query = query.filter(getattr(Recipe, field) == value)
                    print(f"Applied {field} filter: {str(query)}")
                except ValueError:
                    print(f"Invalid numeric value: {value}")
                    value = None
                if value is None:
                    continue

        # Handle calories filter separately since it's in nutrients JSON
        calories = request.args.get('calories')
        if calories:
            print(f"Processing calories filter: {calories}")
            # Clean up the value by removing spaces and extracting operator
            calories = urllib.parse.unquote_plus(calories)  # Use unquote_plus for better handling
            calories = calories.strip()
            
            # Extract operator and value
            if '<=' in calories:
                operator, value = '<=', calories.replace('<=', '')
            elif '>=' in calories:
                operator, value = '>=', calories.replace('>=', '')
            elif '<' in calories:
                operator, value = '<', calories.replace('<', '')
            elif '>' in calories:
                operator, value = '>', calories.replace('>', '')
            else:
                operator, value = '==', calories
            print(f"Extracted calories operator: {operator}, value: {value}")

            # Convert to float after extracting operator
            try:
                value = float(value.strip())
                print(f"Converted calories value: {value}")
                # Apply filter based on operator
                if operator == '<=':
                    query = query.filter(db.text("CAST(json_extract(nutrients, '$.calories') AS REAL) <= :val").params(val=value))
                elif operator == '>=':
                    query = query.filter(db.text("CAST(json_extract(nutrients, '$.calories') AS REAL) >= :val").params(val=value))
                elif operator == '<':
                    query = query.filter(db.text("CAST(json_extract(nutrients, '$.calories') AS REAL) < :val").params(val=value))
                elif operator == '>':
                    query = query.filter(db.text("CAST(json_extract(nutrients, '$.calories') AS REAL) > :val").params(val=value))
                else:
                    query = query.filter(db.text("CAST(json_extract(nutrients, '$.calories') AS REAL) = :val").params(val=value))
                print(f"Applied calories filter: {str(query)}")
            except ValueError:
                print(f"Invalid calories value: {value}")
                # Skip this filter if value is invalid
        
        # Handle text filters
        text_fields = ['title', 'cuisine']
        for field in text_fields:
            value = request.args.get(field)
            if value:
                print(f"Processing text filter {field}: {value}")
                query = query.filter(getattr(Recipe, field).ilike(f'%{value}%'))
                print(f"Applied text filter: {str(query)}")
        
        # Apply pagination
        paginated = query.paginate(page=page, per_page=limit, error_out=False)
        print(f"Paginated results: Total={paginated.total}, Page={page}, Items={len(paginated.items)}")
        
        # Return results with proper error handling
        try:
            results = [recipe.to_dict() for recipe in paginated.items]
            print(f"Found {len(results)} results")
            return jsonify({
                'data': results,
                'total': paginated.total,
                'page': page,
                'limit': limit
            })
        except Exception as e:
            print(f"Error processing results: {str(e)}")
            return jsonify({
                'error': 'Failed to process results',
                'message': str(e)
            }), 500
    except Exception as e:
        print(f"Error in search_recipes: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500
    except Exception as e:
        print(f"Error in search_recipes: {str(e)}")
        return jsonify({'error': 'Failed to search recipes'}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        
        # Try to load data if it's not already loaded
        try:
            recipe = Recipe.query.first()
            if not recipe:
                from load_data import load_data
                load_data()
        except:
            pass
    
    app.run(debug=True)
