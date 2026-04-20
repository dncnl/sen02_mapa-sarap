// ============================================
// MAPA-Sarap: Data Layer with API Integration
// Fetches from backend API endpoints
// ============================================
const API_BASE = '/api'; 

// Fallback data for offline/development (same as seeded data)
const FALLBACK_DATA = {
  restaurants: [
    { id: 1, name: 'Jollibee AUF', cuisine: 'Filipino Fast Food', description: 'Popular Filipino fast food chain known for fried chicken and spaghetti.', address: 'MacArthur Hwy, Angeles City, Pampanga', lat: 15.144760266478606, lng: 120.59528740862909, priceRange: '$', phone: '+63 45 888 1234', website: 'https://www.jollibee.com.ph', imageUrl: 'https://via.placeholder.com/600x400?text=Jollibee+AUF', hours: '7:00 AM - 10:00 PM', status: 'Open', rating: 4.5, reviewCount: 2, distance: '< 0.1 km', amenities: ['Drive Thru', 'Delivery'], popularDishes: ['Yumburger Combo', 'Champ Jr.', 'Super Meal C', 'Super Meal B', 'Super Meal A'] },
    { id: 2, name: 'McDonald\'s Angeles Intersection', cuisine: 'American Fast Food', description: 'Global fast food chain offering burgers, fries, and breakfast meals.', address: 'MacArthur Hwy, Angeles City, Pampanga', lat: 15.142816498032756, lng: 120.59631362397157, priceRange: '$', phone: '+63 45 888 2234', website: 'https://www.mcdonalds.com.ph', imageUrl: 'https://via.placeholder.com/600x400?text=McDonalds+Angeles', hours: '24 Hours', status: 'Open', rating: 4.0, reviewCount: 2, distance: '< 0.1 km', amenities: ['24/7 Service', 'Drive Thru'], popularDishes: ['Double Cheeseburger Meal', 'Cheeseburger Meal', 'Big Mac Meal', 'Quarter Pounder with Cheese Meal', 'Crispy Chicken Sandwich Meal'] },
    { id: 3, name: '24 Chicken Angeles', cuisine: 'Korean', description: 'Korean-style fried chicken with flavorful sauces.', address: 'Angeles City, Pampanga', lat: 15.142285685420413, lng: 120.59696079513589, priceRange: '$$', phone: '+63 45 888 3234', website: 'https://www.facebook.com/24chickenph', imageUrl: 'https://via.placeholder.com/600x400?text=24+Chicken+Angeles', hours: '10:00 AM - 11:00 PM', status: 'Open', rating: 5.0, reviewCount: 2, distance: '< 0.1 km', amenities: ['Takeout', 'Indoor Seating'], popularDishes: ['Original Boneless Chicken', 'Yangnyeom w/ Garlic Boneless Chicken', 'Snow Cheese Boneless Chicken', 'Jack Daniels Boneless Chicken', 'Spicy BBQ Boneless Chicken'] },
    { id: 4, name: 'Wall Street Wraps AUF', cuisine: 'Wraps and Rice Meals', description: 'Quick-service wraps and rice meals for students.', address: 'Near AUF, Angeles City, Pampanga', lat: 15.144080578526435, lng: 120.5957652922267, priceRange: '$', phone: '+63 45 888 4234', website: null, imageUrl: 'https://via.placeholder.com/600x400?text=Wall+Street+Wraps', hours: '8:00 AM - 9:00 PM', status: 'Open', rating: 4.0, reviewCount: 2, distance: '< 0.1 km', amenities: ['Student Meals', 'Takeout'], popularDishes: ['Vegetarian Wrap (Jr.)', 'Uptown Caesar Wrap (Jr.)', 'Little Italy Wrap (Jr.)', 'Downtown Burrito Wrap (Jr.)', 'Thai Chili Express Wrap (Jr.)'] }
  ],
  dishMenus: {
    1: [
      { id: 1001, place_id: 1, name: 'Yumburger Combo', description: 'Classic Yumburger served with sides for a quick and satisfying meal.', price: 118.00, image_url: null },
      { id: 1002, place_id: 1, name: 'Champ Jr.', description: 'A thicker, meatier burger option that still stays budget-friendly.', price: 183.00, image_url: null },
      { id: 1003, place_id: 1, name: 'Super Meal C', description: 'Yumburger with half Jolly Spaghetti, regular fries, and a drink.', price: 129.00, image_url: null },
      { id: 1004, place_id: 1, name: 'Super Meal B', description: 'Chickenjoy with half Jolly Spaghetti, regular fries, and a drink.', price: 180.00, image_url: null },
      { id: 1005, place_id: 1, name: 'Super Meal A', description: 'Chickenjoy with half Jolly Spaghetti, rice, and a drink for bigger appetites.', price: 208.00, image_url: null },
    ],
    2: [
      { id: 2001, place_id: 2, name: 'Double Cheeseburger Meal', description: 'Two beef patties with melted cheese, fries, and a drink in one value meal.', price: 237.00, image_url: null },
      { id: 2002, place_id: 2, name: 'Cheeseburger Meal', description: 'McDonald\'s classic cheeseburger paired with fries and a refreshing drink.', price: 146.00, image_url: null },
      { id: 2003, place_id: 2, name: 'Big Mac Meal', description: 'Iconic layered Big Mac served with fries and a drink.', price: 264.00, image_url: null },
      { id: 2004, place_id: 2, name: 'Quarter Pounder with Cheese Meal', description: 'A juicy quarter-pound beef burger with cheese, fries, and a drink.', price: 264.00, image_url: null },
      { id: 2005, place_id: 2, name: 'Crispy Chicken Sandwich Meal', description: 'Crispy chicken sandwich combo with fries and a drink for everyday cravings.', price: 157.00, image_url: null },
    ],
    3: [
      { id: 3001, place_id: 3, name: 'Original Boneless Chicken', description: 'Crispy boneless fried chicken with a straightforward savory flavor.', price: 215.00, image_url: null },
      { id: 3002, place_id: 3, name: 'Yangnyeom w/ Garlic Boneless Chicken', description: 'Sweet-spicy Korean glaze finished with garlic for a bold kick.', price: 230.00, image_url: null },
      { id: 3003, place_id: 3, name: 'Snow Cheese Boneless Chicken', description: 'Boneless chicken dusted with creamy cheese powder for a rich finish.', price: 230.00, image_url: null },
      { id: 3004, place_id: 3, name: 'Jack Daniels Boneless Chicken', description: 'Smoky-sweet sauce inspired by Jack Daniels flavoring on crispy chicken.', price: 220.00, image_url: null },
      { id: 3005, place_id: 3, name: 'Spicy BBQ Boneless Chicken', description: 'Spicy barbecue-coated chicken with smoky notes and extra heat.', price: 220.00, image_url: null },
    ],
    4: [
      { id: 4001, place_id: 4, name: 'Vegetarian Wrap (Jr.)', description: 'A fresh meat-free wrap with customizable vegetables, dressing, and seasoning.', price: 129.00, image_url: null },
      { id: 4002, place_id: 4, name: 'Uptown Caesar Wrap (Jr.)', description: 'Grilled chicken Caesar wrap with parmesan, croutons, and romaine.', price: 149.00, image_url: null },
      { id: 4003, place_id: 4, name: 'Little Italy Wrap (Jr.)', description: 'Italian-style wrap with roasted peppers, onions, and a herby dressing.', price: 149.00, image_url: null },
      { id: 4004, place_id: 4, name: 'Downtown Burrito Wrap (Jr.)', description: 'Hearty burrito-style wrap with rice, beans, cheese, and Mexican sauce.', price: 149.00, image_url: null },
      { id: 4005, place_id: 4, name: 'Thai Chili Express Wrap (Jr.)', description: 'Thai-inspired wrap with chili ginger sauce and sesame notes.', price: 149.00, image_url: null },
    ],
  },
  reviews: [
    { id: 1, restaurantId: 1, userName: 'marias', rating: 5, comment: 'Chickenjoy is still the best comfort meal near campus.', date: '2026-04-14 08:30:00', helpfulCount: 12 },
    { id: 2, restaurantId: 2, userName: 'juancruz', rating: 4, comment: 'Fast service and reliable breakfast options before class.', date: '2026-04-12 03:00:00', helpfulCount: 9 },
    { id: 3, restaurantId: 3, userName: 'annalee', rating: 5, comment: 'Great sauces and crispy chicken. Best with friends.', date: '2026-04-15 10:00:00', helpfulCount: 14 },
    { id: 4, restaurantId: 4, userName: 'carlor', rating: 4, comment: 'Affordable wraps and rice bowls for students on a budget.', date: '2026-04-13 05:40:00', helpfulCount: 6 }
  ]
};

// ============================================
// GLOBAL DATA STORAGE
// ============================================
let restaurants = [];
let reviews = [];

// ============================================
// API FETCH FUNCTIONS
// ============================================

/**
 * Fetch all restaurants from API with optional filters
 * @param {Object} filters - { cuisine, priceRange, minRating, openOnly }
 * @returns {Array} restaurants array
 */
async function fetchRestaurants(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.cuisine) params.append('cuisine', filters.cuisine);
    if (filters.priceRange) params.append('priceRange', filters.priceRange);
    if (filters.minRating) params.append('minRating', filters.minRating);
    if (filters.openOnly) params.append('openOnly', filters.openOnly);
    if (filters.lat) params.append('lat', filters.lat);
    if (filters.lng) params.append('lng', filters.lng);
    if (filters.radius) params.append('radius', filters.radius);

    const url = `${API_BASE}/restaurants${params.toString() ? '?' + params : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    
    const data = await response.json();
    // Ensure coordinates are mapped correctly if API uses database column names
    restaurants = data.map(r => ({
      ...r,
      lat: r.lat || r.latitude,
      lng: r.lng || r.longitude
    }));

    return restaurants;
  } catch (error) {
    console.warn('Failed to fetch restaurants from API, using fallback:', error);
    restaurants = FALLBACK_DATA.restaurants;
    return restaurants;
  }
}

/**
 * Authenticate user via API
 */
async function loginUser(email, password) {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: email, password })
    });

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      data = null;
    }

    if (!response.ok) {
      throw new Error(data?.error || data?.details || `Server Error ${response.status}`);
    }

    // Save session using the helper in common.js
    db.saveAuthSession(data.user, data.token);
    return data;
  } catch (error) {
    console.error('Login error:', error);
    // Fallback for dev/demo purposes if API is down
    if (email === 'admin@auf.edu.ph' && password === 'password') {
      const mockUser = { id: 99, name: 'AUF Student', email };
      db.saveAuthSession(mockUser, 'mock-token');
      return { user: mockUser };
    }
    throw error;
  }
}

/**
 * Register a new user
 */
async function signupUser(name, email, password) {
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Signup failed');

    // Save session using the helper in common.js
    db.saveAuthSession(data.user, data.token);
    return data;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
}

/**
 * Submit a new review for a restaurant
 */
async function createReviewForRestaurant(restaurantId, comment, rating, token) {
  const response = await fetch(`${API_BASE}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      placeId: restaurantId,
      rating,
      comment,
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || 'Failed to submit review');
  }

  return payload;
}

function getTopRatedRestaurants(limit = 10) {
  return [...restaurants].sort((a, b) => b.rating - a.rating).slice(0, limit);
}

/**
 * Fetch user rankings (Top Contributors)
 */
async function fetchUserLeaderboard() {
  try {
    const response = await fetch(`${API_BASE}/leaderboard/users`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn('Failed to fetch user leaderboard:', error);
    return [];
  }
}

/**
 * Fetch reviews for a specific restaurant
 * @param {number} placeId - restaurant ID
 * @returns {Array} reviews array
 */
async function fetchReviews(placeId) {
  try {
    const token = db.getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await fetch(`${API_BASE}/reviews?placeId=${placeId}`, {
      headers,
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn(`Failed to fetch reviews for restaurant ${placeId}, using fallback:`, error);
    return FALLBACK_DATA.reviews.filter(r => r.restaurantId === parseInt(placeId));
  }
}

/**
 * Fetch statistics from API
 * @returns {Object} stats object
 */
async function fetchStats() {
  try {
    const response = await fetch(`${API_BASE}/stats`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn('Failed to fetch stats from API, using fallback:', error);
    const fallback = FALLBACK_DATA.restaurants;
    return {
      totalRestaurants: fallback.length,
      avgRating: (fallback.reduce((sum, r) => sum + r.rating, 0) / fallback.length).toFixed(1),
      totalReviews: FALLBACK_DATA.reviews.length,
      totalRatings: fallback.reduce((sum, r) => sum + r.reviewCount, 0)
    };
  }
}

/**
 * Initialize data on page load
 */
async function initializeData() {
  try {
    console.log('Loading restaurants from API...');
    await fetchRestaurants();
    console.log(`Loaded ${restaurants.length} restaurants`);
  } catch (error) {
    console.error('Failed to initialize data:', error);
  }
}

// ============================================
// HELPER FUNCTIONS (Frontend API)
// ============================================

// Get all unique cuisines for filter dropdown
function getCuisines() {
  const cuisines = ['All', ...new Set(restaurants.map(r => r.cuisine))];
  return cuisines;
}

// Get aggregated statistics
async function getStats() {
  return await fetchStats();
}

// Get a single restaurant by ID
function getRestaurantById(id) {
  return restaurants.find(r => r.id === parseInt(id));
}

// Get all reviews for a restaurant
async function getReviewsByRestaurantId(restaurantId) {
  return await fetchReviews(restaurantId);
}

// Get all dishes for a restaurant
async function getDishesForRestaurant(restaurantId) {
  try {
    const response = await fetch(`${API_BASE}/dishes?placeId=${restaurantId}`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const dishes = await response.json();
    return dishes.map(d => d.name);
  } catch (error) {
    console.warn(`Failed to fetch dishes for restaurant ${restaurantId}:`, error);
    const rest = getRestaurantById(restaurantId);
    return rest ? rest.popularDishes : [];
  }
}

async function getDishMenuForRestaurant(restaurantId) {
  try {
    const response = await fetch(`${API_BASE}/dishes?placeId=${restaurantId}`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn(`Failed to fetch menu dishes for restaurant ${restaurantId}:`, error);
    const fallbackMenu = FALLBACK_DATA.dishMenus[restaurantId];
    if (Array.isArray(fallbackMenu) && fallbackMenu.length) {
      return fallbackMenu;
    }

    const rest = getRestaurantById(restaurantId);
    if (!rest || !Array.isArray(rest.popularDishes)) return [];

    return rest.popularDishes.map((dishName, index) => ({
      id: restaurantId * 1000 + index + 1,
      place_id: restaurantId,
      name: dishName,
      description: 'Popular dish',
      price: null,
      image_url: null,
    }));
  }
}

async function getDishReviewsByDishId(dishId) {
  try {
    const response = await fetch(`${API_BASE}/dish-reviews?dishId=${dishId}`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn(`Failed to fetch dish reviews for dish ${dishId}:`, error);
    return {
      dishId,
      avgRating: 0,
      totalReviews: 0,
      reviews: [],
    };
  }
}

async function createDishReviewForDish(dishId, rating, comment, token) {
  const response = await fetch(`${API_BASE}/dish-reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      dishId,
      rating,
      comment,
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || 'Failed to submit dish review');
  }

  return payload;
}

// Get all amenities for a restaurant
async function getAmenitiesForRestaurant(restaurantId) {
  try {
    const response = await fetch(`${API_BASE}/amenities?placeId=${restaurantId}`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn(`Failed to fetch amenities for restaurant ${restaurantId}:`, error);
    return [];
  }
}