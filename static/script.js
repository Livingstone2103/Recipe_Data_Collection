// Initialize variables
let currentPage = 1;
let resultsPerPage = 15;
let totalResults = 0;
let totalPages = 0;
let selectedRecipe = null;

// DOM Elements
const recipeTableBody = $('#recipeTableBody');
const pagination = $('#pagination');
const resultsPerPageSelect = $('#resultsPerPage');
const searchInput = $('#searchInput');
const searchBtn = $('#searchBtn');
const cuisineFilter = $('#cuisineFilter');
const ratingFilter = $('#ratingFilter');
const caloriesFilter = $('#caloriesFilter');
const timeFilter = $('#timeFilter');
const sortBySelect = $('#sortBy');
const recipeTitle = $('#recipeTitle');
const recipeCuisine = $('#recipeCuisine');
const recipeDescription = $('#recipeDescription');
const totalTime = $('#totalTime');
const prepTime = $('#prepTime');
const cookTime = $('#cookTime');
const nutritionTableBody = $('#nutritionTableBody');
const timeDetailsBtn = $('#timeDetailsBtn');
const timeDetails = $('#timeDetails');
const noResults = $('#noResults');
const noData = $('#noData');

// Initialize AOS
AOS.init({
    duration: 800,
    once: true
});

// Format time in minutes
function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
}

// Generate star rating HTML
function generateStars(rating) {
    const stars = Math.floor(rating);
    const decimal = rating - stars;
    let html = '';
    
    for (let i = 0; i < 5; i++) {
        if (i < stars) {
            html += '<i class="fas fa-star rating-stars"></i>';
        } else if (i === stars && decimal > 0) {
            html += '<i class="fas fa-star-half-alt rating-stars"></i>';
        } else {
            html += '<i class="far fa-star rating-stars"></i>';
        }
    }
    return html;
}

// Update pagination
function updatePagination() {
    pagination.empty();
    
    if (totalPages === 0) return;
    
    // Add previous button
    pagination.append(`<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>
    </li>`);

    // Add page numbers with ellipsis
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    // Adjust start and end pages if they exceed max visible pages
    if (endPage - startPage + 1 > maxVisiblePages) {
        if (currentPage < Math.ceil(maxVisiblePages / 2)) {
            endPage = maxVisiblePages;
        } else if (currentPage > totalPages - Math.floor(maxVisiblePages / 2)) {
            startPage = totalPages - maxVisiblePages + 1;
        }
    }

    // Add first page if not in range
    if (startPage > 1) {
        pagination.append('<li class="page-item"><a class="page-link" href="#" data-page="1">1</a></li>');
        if (startPage > 2) {
            pagination.append('<li class="page-item disabled"><a class="page-link">...</a></li>');
        }
    }

    // Add visible pages
    for (let i = startPage; i <= endPage; i++) {
        pagination.append(`<li class="page-item ${i === currentPage ? 'active' : ''}">
            <a class="page-link" href="#" data-page="${i}">${i}</a>
        </li>`);
    }

    // Add last page if not in range
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            pagination.append('<li class="page-item disabled"><a class="page-link">...</a></li>');
        }
        pagination.append(`<li class="page-item"><a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a></li>`);
    }

    // Add next button
    pagination.append(`<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
    </li>`);
}

// Format nutrition data
function formatNutrition(nutrients) {
    const rows = [];
    const keys = ['calories', 'carbohydrateContent', 'cholesterolContent', 'fiberContent',
                 'proteinContent', 'saturatedFatContent', 'sodiumContent', 'sugarContent', 'fatContent'];
    
    keys.forEach(key => {
        if (nutrients[key]) {
            rows.push(`<tr>
                <td>${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</td>
                <td>${nutrients[key]}</td>
            </tr>`);
        }
    });
    
    return rows.join('');
}

// Fetch recipes
async function fetchRecipes(page = 1, limit = resultsPerPage) {
    try {
        const response = await fetch(`http://127.0.0.1:5000/api/recipes?page=${page}&limit=${limit}`);
        const data = await response.json();
        
        if (data.error) {
            console.error('API Error:', data.error);
            noData.removeClass('d-none');
            return;
        }
        
        if (data.total === 0) {
            noResults.removeClass('d-none');
            return;
        }
        
        noResults.addClass('d-none');
        totalResults = data.total;
        totalPages = Math.ceil(totalResults / limit);
        currentPage = page;
        resultsPerPage = limit;
        
        recipeTableBody.empty();
        
        if (Array.isArray(data.data)) {
            data.data.forEach(recipe => {
                const row = $(`
                    <tr data-id="${recipe.id}" onclick="selectRecipe(${recipe.id})" data-aos="fade-up">
                        <td class="title-truncated">${recipe.title || ''}</td>
                        <td>${recipe.cuisine || ''}</td>
                        <td>${generateStars(recipe.rating || 0)}</td>
                        <td>${recipe.total_time ? formatTime(recipe.total_time) : '-'}</td>
                        <td>${recipe.serves || ''}</td>
                    </tr>
                `);
                row.data('recipe', recipe);
                recipeTableBody.append(row);
            });
        }
        
        updatePagination();
    } catch (error) {
        console.error('Error fetching recipes:', error);
        noData.removeClass('d-none');
    }
}

// Search recipes
async function searchRecipes(page = 1) {
    try {
        const params = new URLSearchParams();
        
        // Add pagination
        params.append('page', page);
        params.append('limit', resultsPerPage);
        
        // Add filters
        if (cuisineFilter.val()) {
            const cuisineValue = cuisineFilter.val().trim();
            params.append('cuisine', cuisineValue);
        }
        if (ratingFilter.val()) {
            const ratingValue = ratingFilter.val().trim().replace(/\s+/g, '');
            params.append('rating', ratingValue);
        }
        if (caloriesFilter.val()) {
            const caloriesValue = caloriesFilter.val().trim().replace(/\s+/g, '');
            params.append('calories', caloriesValue);
        }
        if (timeFilter.val()) {
            const timeValue = timeFilter.val().trim().replace(/\s+/g, '');
            params.append('total_time', timeValue);
        }

        const response = await fetch(`/api/recipes/search?${params.toString()}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (!data || !data.data) {
            throw new Error('Invalid response format');
        }
        
        if (data.data.length === 0) {
            noResults.removeClass('d-none');
            return;
        }
        
        noResults.addClass('d-none');
        totalResults = data.total;
        totalPages = Math.ceil(totalResults / resultsPerPage);
        currentPage = page;
        
        recipeTableBody.empty();
        data.data.forEach(recipe => {
            const row = $(`
                <tr data-id="${recipe.id}" onclick="selectRecipe(${recipe.id})" data-aos="fade-up">
                    <td class="title-truncated">${recipe.title || ''}</td>
                    <td>${recipe.cuisine || ''}</td>
                    <td>${generateStars(recipe.rating || 0)}</td>
                    <td>${recipe.total_time ? formatTime(recipe.total_time) : '-'}</td>
                    <td>${recipe.serves || ''}</td>
                </tr>
            `);
            row.data('recipe', recipe);
            recipeTableBody.append(row);
        });
        
        updatePagination();
    } catch (error) {
        console.error('Error searching recipes:', error);
        noData.removeClass('d-none');
    }
}

// Select recipe
function selectRecipe(id) {
    const selectedRow = recipeTableBody.find(`tr[data-id="${id}"]`);
    if (!selectedRow.length) return;
    
    // Clear previous selection
    recipeTableBody.find('tr').removeClass('table-active');
    selectedRow.addClass('table-active');
    
    // Get recipe data
    const recipe = selectedRow.data('recipe');
    if (!recipe) return;
    
    // Update details panel
    recipeTitle.text(recipe.title);
    recipeCuisine.text(recipe.cuisine);
    recipeDescription.text(recipe.description);
    totalTime.text(formatTime(recipe.total_time));
    prepTime.text(formatTime(recipe.prep_time));
    cookTime.text(formatTime(recipe.cook_time));
    nutritionTableBody.html(formatNutrition(recipe.nutrients));
    
    // Show time details
    timeDetails.show();
    timeDetailsBtn.find('i').removeClass('fa-chevron-down').addClass('fa-chevron-up');
}

// Event Listeners
resultsPerPageSelect.change(() => {
    resultsPerPage = parseInt(resultsPerPageSelect.val());
    fetchRecipes(1, resultsPerPage);
});

sortBySelect.change(() => {
    fetchRecipes(1, resultsPerPage);
});

searchBtn.click(() => searchRecipes(1));
searchInput.keyup((e) => {
    if (e.key === 'Enter') searchRecipes();
});

timeDetailsBtn.click(() => {
    timeDetails.toggle();
    const icon = timeDetailsBtn.find('i');
    icon.toggleClass('fa-chevron-down fa-chevron-up');
});

pagination.on('click', '.page-link', function(e) {
    e.preventDefault();
    const page = $(this).data('page');
    if (page) fetchRecipes(page, resultsPerPage);
});

// Initialize when document is ready
$(document).ready(function() {
    fetchRecipes();
});
