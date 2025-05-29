# Recipe Explorer API

A Flask-based API for searching and filtering recipes with a modern frontend interface.

## Features

- Search recipes by cuisine, calories, rating, and cooking time
- Pagination support
- Detailed recipe information display
- Modern and responsive UI
- JSON-based data storage

## Detailed Setup Guide

### 1. System Requirements

This project requires:
- Python 3.8 or higher (Python 3.10 recommended)
- pip (Python package manager)
- SQLite (automatically included with Python)
- A modern web browser (Chrome, Firefox, Safari, or Edge)

### 2. Step-by-Step Installation

#### Step 1: Clone the Repository

First, you need to clone this repository to your local machine. If you have git installed, run:

```bash
git clone https://github.com/yourusername/recipe-explorer.git
cd recipe-explorer
```

If you don't have git, you can download the ZIP file from GitHub and extract it to your desired location.

#### Step 2: Create Virtual Environment

A virtual environment helps keep your project's dependencies separate from your system Python installation. Create one by running:

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate
```

You'll know the virtual environment is activated when you see `(venv)` at the start of your command prompt.

#### Step 3: Install Required Packages

Install all necessary Python packages using pip:

```bash
pip install -r requirements.txt
```

This will install:
- Flask (web framework)
- Flask-SQLAlchemy (database integration)
- Flask-CORS (cross-origin resource sharing)

#### Step 4: Initialize Database

The first time you run the application, it will create a SQLite database file called `recipes.db`. Run:

```bash
python app.py
```

You might see some warning messages - these are normal and can be ignored.

#### Step 5: Load Sample Data (Optional)

If you want to test the application with some sample recipes, run:

```bash
python load_data.py
```

This will populate your database with some example recipes.

#### Step 6: Start the Application

Start the Flask development server by running:

```bash
python app.py
```

The server will start on `http://127.0.0.1:5000`. You can open this URL in your web browser to access the application.

### 7. Troubleshooting Common Issues

1. **Port Already in Use**: If you see an error about port 5000 being in use, you can either:
   - Stop the other process using port 5000
   - Or modify `app.py` to use a different port

2. **Database Errors**: If you encounter database errors:
   - Delete the `recipes.db` file
   - Run `python app.py` again to recreate the database
   - Run `python load_data.py` again to reload sample data

3. **Virtual Environment Issues**: If you're having trouble with the virtual environment:
   - Deactivate it by running `deactivate`
   - Delete the `venv` folder
   - Create a new virtual environment and reinstall packages

## Project Structure

```
recipe-explorer/
├── app.py              # Main Flask application
├── load_data.py        # Script to load sample data
├── requirements.txt    # Python dependencies
├── static/
│   ├── css/
│   │   └── styles.css # Frontend styles
│   ├── js/
│   │   └── script.js  # Frontend JavaScript
├── templates/
│   └── index.html     # Main HTML template
└── README.md          # This file
```

## API Endpoints and Examples

### 1. GET /api/recipes

#### Description
This endpoint returns a paginated list of all recipes in the database.

#### Parameters
- `page`: The page number to retrieve (default: 1)
- `limit`: Number of items per page (default: 10)

#### Example Usage

1. Get first page with default settings:
```bash
curl http://127.0.0.1:5000/api/recipes
```

2. Get second page with 15 items:
```bash
curl "http://127.0.0.1:5000/api/recipes?page=2&limit=15"
```

3. Using JavaScript:
```javascript
fetch('http://127.0.0.1:5000/api/recipes?page=1&limit=10')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
```

### 2. GET /api/recipes/search

#### Description
This endpoint allows you to search and filter recipes based on various criteria.

#### Parameters
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 15)
- `cuisine`: Filter by cuisine name (e.g., "Italian", "Chinese")
- `calories`: Filter by calories using comparison operators:
  - `<` for less than
  - `>` for greater than
  - `<=` for less than or equal to
  - `>=` for greater than or equal to
- `rating`: Filter by rating (0-5) using comparison operators
- `total_time`: Filter by total cooking time (minutes) using comparison operators

#### Example Usage

1. Search by cuisine:
```bash
curl "http://127.0.0.1:5000/api/recipes/search?cuisine=Italian"
```

2. Search by calories (less than 500):
```bash
curl "http://127.0.0.1:5000/api/recipes/search?calories=<500"
```

3. Search by rating (greater than 4):
```bash
curl "http://127.0.0.1:5000/api/recipes/search?rating=>4"
```

4. Search by multiple filters:
```bash
curl "http://127.0.0.1:5000/api/recipes/search?cuisine=Italian&calories=<500&rating=>4"
```

5. Using JavaScript:
```javascript
const searchParams = new URLSearchParams({
    cuisine: 'Italian',
    calories: '<500',
    page: 1,
    limit: 15
});

fetch(`/api/recipes/search?${searchParams.toString()}`)
    .then(response => response.json())
    .then(data => {
        console.log('Total results:', data.total);
        console.log('Recipes:', data.data);
    })
    .catch(error => console.error('Error:', error));
```

#### Response Format
The API returns a JSON object with the following structure:
```json
{
    "page": 1,
    "limit": 15,
    "total": 100,  // Total number of matching recipes
    "data": [
        {
            "id": 1,
            "title": "Recipe Title",
            "cuisine": "Italian",
            "rating": 4.5,
            "prep_time": 30,
            "cook_time": 45,
            "total_time": 75,
            "description": "Recipe description",
            "nutrients": {
                "calories": 450,
                "protein": "20g",
                "carbs": "35g",
                "fat": "15g"
            },
            "serves": "4 people"
        }
    ]
}
```

## Frontend Components and Features

### 1. Recipe Model

The Recipe model defines the structure of our recipe data. Each recipe has:

- `id`: Unique identifier for each recipe
- `cuisine`: Type of cuisine (e.g., Italian, Chinese)
- `title`: Name of the recipe
- `rating`: User rating (0-5)
- `prep_time`: Time needed for preparation (minutes)
- `cook_time`: Time needed for cooking (minutes)
- `total_time`: Combined preparation and cooking time
- `description`: Detailed recipe description
- `nutrients`: JSON object containing nutritional information
- `serves`: Number of servings the recipe makes

Example of a Recipe object:
```python
{
    "id": 1,
    "title": "Spaghetti Carbonara",
    "cuisine": "Italian",
    "rating": 4.8,
    "prep_time": 15,
    "cook_time": 20,
    "total_time": 35,
    "description": "Classic Italian pasta dish with eggs, cheese, and pancetta",
    "nutrients": {
        "calories": 550,
        "protein": "25g",
        "carbs": "45g",
        "fat": "20g"
    },
    "serves": "2 people"
}
```

### 2. Key Functions

#### search_recipes()
This function handles all search and filtering operations:

1. Accepts search parameters from the frontend
2. Processes numeric filters (calories, rating, time)
3. Handles text filters (cuisine)
4. Applies pagination
5. Returns formatted results

Example usage in Python:
```python
# Get recipes with less than 500 calories
recipes = search_recipes(calories="<500")

# Get Italian recipes with rating greater than 4
recipes = search_recipes(cuisine="Italian", rating=">4")
```

#### get_recipes()
This function retrieves recipes with pagination:

1. Accepts page and limit parameters
2. Sorts recipes by ID
3. Returns paginated results
4. Includes total count for pagination

Example usage in Python:
```python
# Get first page of recipes
recipes = get_recipes(page=1, limit=10)

# Get second page with 15 items
recipes = get_recipes(page=2, limit=15)
```

### 3. Frontend Features

#### Search Filters
The frontend provides several ways to filter recipes:

1. **Cuisine Filter**: Search by cuisine type
   - Example: "Italian", "Chinese", "Mexican"
   - Case-insensitive search
   - Partial matches supported

2. **Calories Filter**: Filter by calorie count
   - Use comparison operators: <, >, <=, >=
   - Example: "<500" for less than 500 calories
   - Supports decimal values

3. **Rating Filter**: Filter by recipe rating
   - Range: 0 to 5 stars
   - Use comparison operators
   - Example: ">4" for ratings greater than 4

4. **Total Time Filter**: Filter by cooking time
   - Measured in minutes
   - Use comparison operators
   - Example: "<=30" for recipes taking 30 minutes or less

#### Pagination
The frontend implements a user-friendly pagination system:

- Displays 15 items per page by default
- Shows page numbers with ellipsis for better navigation
- Maintains current page selection when filtering
- Shows total number of results
- Automatically updates when filters change

Example of pagination display:
```
1 2 3 ... 10 11 12 ... 20 21 22
```

#### Recipe Display
Each recipe is displayed in a clean, responsive table format:

- **Title**: Recipe name (truncated if too long)
- **Cuisine**: Type of cuisine
- **Rating**: Star rating (0-5 stars)
- **Total Time**: Combined preparation and cooking time
- **Serves**: Number of servings

All rows are clickable and can show more detailed information when selected.

### 3. Frontend Features

#### Search Filters
- Cuisine: Text search
- Calories: Numeric filter with comparison operators
- Rating: Numeric filter with comparison operators
- Total Time: Numeric filter with comparison operators

#### Pagination
- Displays 15 items per page by default
- Shows page numbers with ellipsis for better navigation
- Maintains current page selection

#### Recipe Display
- Shows recipe title, cuisine, rating, cooking time, and servings
- Clickable rows to view full recipe details
- Responsive table layout

## Usage Examples

### Search Recipes

1. Search by cuisine:
```
GET /api/recipes/search?cuisine=peach
```

2. Search by calories (less than 500):
```
GET /api/recipes/search?calories=<500
```

3. Search by rating (greater than 4):
```
GET /api/recipes/search?rating=>4
```

### Pagination

1. Get second page with 15 items:
```
GET /api/recipes/search?page=2&limit=15
```

## Error Handling

The API includes comprehensive error handling:
- Invalid parameters
- Database errors
- Invalid JSON data
- Pagination errors
- Filter validation

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
#   R e c i p e _ D a t a _ C o l l e c t i o n  
 # Recipe_Data_Collection
