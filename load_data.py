from app import app, db, Recipe
import json

def load_data():
    with app.app_context():
        # Ensure database is created
        db.create_all()
        
        # Clear existing data
        Recipe.query.delete()
        db.session.commit()
        
        # Load recipes
        with open('data.json', 'r') as f:
            # Read the entire file as a single JSON object
            recipes_dict = json.load(f)
            
            # Process each recipe (keys are numeric strings)
            for key in recipes_dict:
                recipe_data = recipes_dict[key]
                try:
                    # Convert None values to appropriate defaults
                    recipe = Recipe(
                        cuisine=recipe_data.get('cuisine', ''),
                        title=recipe_data.get('title', ''),
                        rating=recipe_data.get('rating'),
                        prep_time=recipe_data.get('prep_time'),
                        cook_time=recipe_data.get('cook_time'),
                        total_time=recipe_data.get('total_time'),
                        description=recipe_data.get('description', ''),
                        nutrients=recipe_data.get('nutrients', {}),
                        serves=recipe_data.get('serves', '')
                    )
                    
                    # Add to session and flush to get ID
                    db.session.add(recipe)
                    db.session.flush()
                    
                    # Print the ID to verify it's being generated
                    print(f"Added recipe {recipe.id}: {recipe.title}")
                    
                except Exception as e:
                    print(f"Error processing recipe: {str(e)}")
                    db.session.rollback()
                    continue
            
        # Final commit
        db.session.commit()
        print("Data loaded successfully!")

if __name__ == '__main__':
    load_data()
