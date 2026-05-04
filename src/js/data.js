// ============================================
// MAPA-Sarap: Data Layer with API Integration
// Fetches from backend API endpoints
// ============================================
const API_BASE = '/api'; 

// ============================================
// FALLBACK DATA 
// ============================================
const FALLBACK_DATA = {
  restaurants: [
    { 
      id: 1, 
      name: 'Jollibee AUF', 
      cuisine: 'Filipino Fast Food', 
      description: 'Popular Filipino fast food chain known for fried chicken and spaghetti.', 
      address: 'MacArthur Hwy, Angeles City, Pampanga', 
      lat: 15.144760, 
      lng: 120.595287, 
      priceRange: '$', 
      imageUrl: 'https://via.placeholder.com/600x400?text=Jollibee+AUF', 
      hours: '7:00 AM - 10:00 PM', 
      status: 'Open', 
      rating: 4.5, 
      reviewCount: 12, 
      popularDishes: ['Chickenjoy', 'Jolly Spaghetti'] 
    },
    { 
      id: 2, 
      name: "McDonald's Angeles Intersection", 
      cuisine: 'American Fast Food', 
      description: 'Global fast food chain offering burgers, fries, and breakfast meals.', 
      address: 'MacArthur Hwy, Angeles City, Pampanga', 
      lat: 15.142816, 
      lng: 120.596313, 
      priceRange: '$', 
      imageUrl: 'https://via.placeholder.com/600x400?text=McDonalds', 
      hours: '24 Hours', 
      status: 'Open', 
      rating: 4.2, 
      reviewCount: 8, 
      popularDishes: ['Big Mac', 'McChicken'] 
    },
    { 
      id: 3, 
      name: '24 Chicken Angeles', 
      cuisine: 'Korean', 
      description: 'Korean-style fried chicken with flavorful sauces.', 
      address: 'Angeles City, Pampanga', 
      lat: 15.142285, 
      lng: 120.596960, 
      priceRange: '$$', 
      imageUrl: 'https://via.placeholder.com/600x400?text=24+Chicken', 
      hours: '10:00 AM - 11:00 PM', 
      status: 'Open', 
      rating: 4.8, 
      reviewCount: 15, 
      popularDishes: ['Yangnyeom Chicken', 'Snow Cheese Chicken'] 
    },
    { 
      id: 4, 
      name: 'Wall Street Wraps AUF', 
      cuisine: 'Wraps and Rice Meals', 
      description: 'Quick-service wraps and rice meals for students.', 
      address: 'Near AUF, Angeles City, Pampanga', 
      lat: 15.144080, 
      lng: 120.595765, 
      priceRange: '$', 
      imageUrl: 'https://via.placeholder.com/600x400?text=Wall+Street+Wraps', 
      hours: '8:00 AM - 9:00 PM', 
      status: 'Open', 
      rating: 4.3, 
      reviewCount: 7, 
      popularDishes: ['Chicken Wrap', 'Beef Rice Meal'] 
    },
    // === More Real Places ===
    { 
      id: 8, name: '25 Seeds', cuisine: 'Restaurant', address: '2F, Dycaico Ancestral House, Angeles', 
      lat: 15.136161, lng: 120.588835, priceRange: '$$', imageUrl: 'https://via.placeholder.com/600x400?text=25+Seeds', 
      status: 'Open', rating: 4.6, reviewCount: 5, popularDishes: ['Salads', 'Healthy Bowls'] 
    },
    { 
      id: 39, name: "Aling Lucing", cuisine: 'Restaurant', address: 'Glaciano Valdez St, Angeles', 
      lat: 15.147528, lng: 120.589768, priceRange: '$', imageUrl: 'https://via.placeholder.com/600x400?text=Aling+Lucing', 
      status: 'Open', rating: 4.4, reviewCount: 9, popularDishes: ['Sisig', 'Lechon'] 
    },
    { 
      id: 52, name: "Andok's Angeles 1", cuisine: 'Fried Chicken', address: 'MacArthur Hwy, Angeles', 
      lat: 15.143575, lng: 120.596462, priceRange: '$', imageUrl: 'https://via.placeholder.com/600x400?text=Andoks', 
      status: 'Open', rating: 4.3, reviewCount: 11, popularDishes: ['Liempo', 'Fried Chicken'] 
    },
    { 
      id: 67, name: "BRMC Bar and Grill", cuisine: 'Bar & Grill', address: 'Marisol Village, Angeles', 
      lat: 15.150104, lng: 120.593705, priceRange: '$', imageUrl: 'https://via.placeholder.com/600x400?text=BRMC', 
      status: 'Open', rating: 4.5, reviewCount: 6, popularDishes: ['Grilled Meats'] 
    },
    { 
      id: 84, name: "Apag Bulaluhan", cuisine: 'Restaurant', address: 'Magalang Ave, Angeles', 
      lat: 15.148860, lng: 120.594281, priceRange: '$', imageUrl: 'https://via.placeholder.com/600x400?text=Apag', 
      status: 'Open', rating: 4.7, reviewCount: 8, popularDishes: ['Bulalo', 'Filipino Classics'] 
    },
    { 
      id: 19, name: "Ate Malou's Catering", cuisine: 'Restaurant', address: 'Santo Entiero St, Angeles', 
      lat: 15.141140, lng: 120.595262, priceRange: '$', imageUrl: 'https://via.placeholder.com/600x400?text=Ate+Malou', 
      status: 'Open', rating: 4.4, reviewCount: 7, popularDishes: ['Catering Meals'] 
    }
  ],

  reviews: [
    { id: 1, restaurantId: 1, userName: 'marias', rating: 5, comment: 'Chickenjoy is still the best comfort meal near campus.', date: '2026-04-14 08:30:00', helpfulCount: 12 },
    { id: 2, restaurantId: 2, userName: 'juancruz', rating: 4, comment: 'Fast service and reliable breakfast options before class.', date: '2026-04-12 03:00:00', helpfulCount: 9 },
    { id: 3, restaurantId: 3, userName: 'annalee', rating: 5, comment: 'Great sauces and crispy chicken. Best with friends.', date: '2026-04-15 10:00:00', helpfulCount: 14 },
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

    // If the API returns successfully but the database is empty (common in new production deploys),
    // we throw an error to trigger the FALLBACK_DATA logic so the UI isn't empty.
    if (!Array.isArray(data) || data.length === 0) throw new Error('No data found in API');
    
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
      body: JSON.stringify({ email: email.trim().toLowerCase(), password })
    });

    const data = await response.json().catch(() => ({}));

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
      body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password })
    });

    const data = await response.json().catch(() => ({}));
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

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) {
      db.logout();
      alert('Your session has expired. Please log in again.');
      window.location.href = window.location.pathname.includes('/pages/') 
        ? '../auth/login.html' 
        : './src/pages/auth/login.html';
      throw new Error('Session expired');
    }
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
 * Stats are served via /api/restaurants?stats=true to keep serverless
 * function count within Vercel Hobby plan's 12-function limit.
 * @returns {Object} stats object
 */
async function fetchStats() {
  try {
    const response = await fetch(`${API_BASE}/restaurants?stats=true`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn('Failed to fetch stats from API, using fallback:', error);
    const fallback = FALLBACK_DATA.restaurants;
    return {
      totalRestaurants: fallback.length,
      avgRating: (fallback.reduce((sum, r) => sum + r.rating, 0) / fallback.length).toFixed(1),
      totalReviews: FALLBACK_DATA.reviews.length,
      totalRatings: fallback.reduce((sum, r) => sum + r.reviewCount, 0),
      topRatedDish: null,
      activeFoodies: 0
    };
  }
}

// ============================================
// FAVORITES API FUNCTIONS
// ============================================

/**
 * Fetch all favorited place IDs from the server for the logged-in user.
 * @param {string} token - JWT token
 * @returns {string[]} array of place ID strings
 */
async function fetchFavoritesFromServer(token) {
  try {
    // Use a cache-buster query parameter because Vercel previously served this as an immutable static JS file,
    // which caused aggressive browser-level caching of the raw source code.
    const response = await fetch(`${API_BASE}/favorites?_cb=1`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      if (response.status === 401) {
        db.logout();
        window.location.href = window.location.pathname.includes('/pages/') 
          ? '../auth/login.html' 
          : './src/pages/auth/login.html';
      }
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data.favorites) ? data.favorites.map(String) : [];
  } catch (error) {
    console.warn('Failed to fetch favorites from server:', error);
    return null; // null signals caller to fall back to localStorage
  }
}

/**
 * Add a favorite on the server.
 * @param {number|string} placeId
 * @param {string} token
 */
async function addFavoriteToServer(placeId, token) {
  try {
    const response = await fetch(`${API_BASE}/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ placeId: parseInt(placeId, 10) }),
    });
    if (!response.ok) {
      if (response.status === 401) {
        db.logout();
        alert('Your session has expired. Please log in again.');
        window.location.href = window.location.pathname.includes('/pages/') 
          ? '../auth/login.html' 
          : './src/pages/auth/login.html';
        throw new Error('Session expired');
      }
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Server error ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn('Failed to add favorite on server:', error);
    return null;
  }
}

/**
 * Remove a favorite on the server.
 * @param {number|string} placeId
 * @param {string} token
 */
async function removeFavoriteFromServer(placeId, token) {
  try {
    const response = await fetch(`${API_BASE}/favorites`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ placeId: parseInt(placeId, 10) }),
    });
    if (!response.ok) {
      if (response.status === 401) {
        db.logout();
        alert('Your session has expired. Please log in again.');
        window.location.href = window.location.pathname.includes('/pages/') 
          ? '../auth/login.html' 
          : './src/pages/auth/login.html';
        throw new Error('Session expired');
      }
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Server error ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn('Failed to remove favorite on server:', error);
    return null;
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
    // Sync favorites from server (bidirectional) for logged-in users.
    // db is defined in common.js which is loaded after data.js, so we
    // defer via setTimeout(0) to ensure common.js is parsed first.
    setTimeout(async () => {
      if (typeof db !== 'undefined' && db.hasValidSession()) {
        await db.syncFavoritesFromServer();
      }
    }, 0);
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
  return restaurants.find(r => String(r.id) === String(id));
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

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) {
      db.logout();
      alert('Your session has expired. Please log in again.');
      window.location.href = window.location.pathname.includes('/pages/') 
        ? '../auth/login.html' 
        : './src/pages/auth/login.html';
      throw new Error('Session expired');
    }
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
