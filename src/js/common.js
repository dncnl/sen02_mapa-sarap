// ============================================
// MAPA-Sarap: Common Utilities & Shared Functions
// ============================================

// ============================================
// PATH HELPERS
// ============================================

// Detect current page location and set appropriate base paths
const pagePaths = (() => {
  const currentPage = window.location.pathname;
  
  // Determine location based on directory structure
  const isAuthPage = currentPage.includes('/auth/');
  const isPageFile = currentPage.includes('/pages/') && !isAuthPage;
  const isRoot = !isAuthPage && !isPageFile;
  
  return {
    // For login link - works from all pages
    loginPath: isRoot ? 'src/pages/auth/login.html' : (isPageFile ? 'auth/login.html' : 'login.html'),
    // For restaurant detail - works from pages directory
    detailPath: isRoot ? 'src/pages/restaurant-detail.html' : (isPageFile || isAuthPage ? 'restaurant-detail.html' : '../restaurant-detail.html'),
    // For home redirect
    homePath: isRoot ? 'index.html' : (isPageFile ? '../../index.html' : '../../../index.html'),
    // For profile page
    profilePath: isRoot ? 'src/pages/profile.html' : (isPageFile || isAuthPage ? 'profile.html' : '../profile.html')
  };
})();

// ============================================
// LOCAL STORAGE MANAGEMENT
// ============================================

const db = {
  getFavorites() {
    const favorites = localStorage.getItem('mapa-favorites');
    return favorites ? JSON.parse(favorites) : [];
  },

  saveFavorite(restaurantId) {
    const favorites = this.getFavorites();
    if (!favorites.includes(restaurantId)) {
      favorites.push(restaurantId);
      localStorage.setItem('mapa-favorites', JSON.stringify(favorites));
    }
  },

  removeFavorite(restaurantId) {
    const favorites = this.getFavorites();
    const filtered = favorites.filter(id => id !== restaurantId);
    localStorage.setItem('mapa-favorites', JSON.stringify(filtered));
  },

  isFavorite(restaurantId) {
    return this.getFavorites().includes(restaurantId);
  },

  getUser() {
    const user = localStorage.getItem('mapa-user');
    return user ? JSON.parse(user) : null;
  },

  saveUser(user) {
    localStorage.setItem('mapa-user', JSON.stringify(user));
  },

  logout() {
    localStorage.removeItem('mapa-user');
  },

  isLoggedIn() {
    return this.getUser() !== null;
  }
};

// ============================================
// NAVIGATION & HEADER
// ============================================

function setupHeader() {
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('nav');

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      nav.classList.toggle('active');
    });
  }

  // Close nav when clicking a link
  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('active');
    });
  });

  updateHeaderAuth();
}

async function updateHeaderAuth() {
  const user = await db.getUser();
  const authContainer = document.querySelector('.header-actions');

  if (!authContainer) return;

  let html = '';

  if (user) {
    html = `
      <span class="text-sm text-muted-foreground">Hello, ${user.name}!</span>
      <button class="btn btn-small btn-outline" onclick="logout()">Logout</button>
    `;
  } else {
    html = `
      <a href="${pagePaths.loginPath}" class="btn btn-small btn-primary">Login</a>
    `;
  }

  authContainer.innerHTML = html;
}

async function logout() {
  await db.logout();
  updateHeaderAuth();
  window.location.href = pagePaths.homePath;
}

// ============================================
// STAR RATING
// ============================================

function renderStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 !== 0;
  let stars = '★'.repeat(fullStars);
  if (hasHalf) stars += '✧';
  stars += '☆'.repeat(5 - Math.ceil(rating));
  return stars;
}

// ============================================
// RESTAURANT CARD RENDERING
// ============================================

async function createRestaurantCard(restaurant) {
  const isFavorited = await db.isFavorite(restaurant.id);
  const statusClass = restaurant.status === 'Open' ? 'restaurant-badge' : 'restaurant-badge closed';
  const fallbackImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect fill='%23e0e0e0' width='300' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='16' fill='%23999'%3E🍽️ No Image%3C/text%3E%3C/svg%3E";

  return `
    <div class="restaurant-card" onclick="window.location.href='${pagePaths.detailPath}?id=${restaurant.id}'">
      <img src="${restaurant.imageUrl}" alt="${restaurant.name}" class="restaurant-image" onerror="this.src='${fallbackImage}'">
      <div class="restaurant-content">
        <div class="restaurant-header">
          <div class="restaurant-name">${restaurant.name}</div>
          <button class="favorite-btn ${isFavorited ? 'active' : ''}" 
                  onclick="event.stopPropagation(); toggleFavorite(${restaurant.id}, this)">
            ${isFavorited ? '♥' : '♡'}
          </button>
        </div>
        <div class="restaurant-meta">
          <span class="star-rating">${renderStars(restaurant.rating)} <span class="rating-number">${restaurant.rating}</span></span>
          <span>(${restaurant.reviewCount})</span>
          <span>${restaurant.priceRange}</span>
        </div>
        <span class="${statusClass}">${restaurant.status}</span>
        <div class="restaurant-address">${restaurant.address}</div>
      </div>
    </div>
  `;
}

async function toggleFavorite(restaurantId, button) {
  const user = await db.getUser();
  if (!user) {
    alert('Please login to add favorites');
    window.location.href = pagePaths.loginPath;
    return;
  }

  if (await db.isFavorite(restaurantId)) {
    await db.removeFavorite(restaurantId);
    button.textContent = '♡';
    button.classList.remove('active');
  } else {
    await db.saveFavorite(restaurantId);
    button.textContent = '♥';
    button.classList.add('active');
  }
}

// ============================================
// RESTAURANT GRID
// ============================================

async function renderRestaurantGrid(filteredRestaurants, containerId = 'restaurants-grid') {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (filteredRestaurants.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
        <p style="color: var(--muted-foreground);">No restaurants found matching your filters.</p>
      </div>
    `;
    return;
  }

  const cards = await Promise.all(filteredRestaurants.map(r => createRestaurantCard(r)));
  container.innerHTML = cards.join('');
}

// ============================================
// FILTERING & SEARCH
// ============================================

function filterRestaurants() {
  const searchQuery = document.getElementById('search-input')?.value || '';
  const selectedCuisine = document.getElementById('cuisine-filter')?.value || 'All';
  const selectedPrice = document.getElementById('price-filter')?.value || 'All';
  const selectedRating = parseFloat(document.getElementById('rating-filter')?.value || 0);
  const isOpenOnly = document.getElementById('open-only-filter')?.checked || false;

  const filtered = restaurants.filter(restaurant => {
    const matchesSearch = searchQuery === '' ||
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCuisine = selectedCuisine === 'All' || restaurant.cuisine === selectedCuisine;
    const matchesPrice = selectedPrice === 'All' || restaurant.priceRange === selectedPrice;
    const matchesRating = restaurant.rating >= selectedRating;
    const matchesOpenNow = !isOpenOnly || restaurant.status === 'Open';

    return matchesSearch && matchesCuisine && matchesPrice && matchesRating && matchesOpenNow;
  });

  return filtered;
}

function setupFilters() {
  const searchInput = document.getElementById('search-input');
  const filters = ['cuisine-filter', 'price-filter', 'rating-filter', 'open-only-filter'];

  const updateResults = () => {
    const filtered = filterRestaurants();
    renderRestaurantGrid(filtered);
    // Update map markers if map is visible
    if (typeof updateMapMarkers === 'function') {
      updateMapMarkers();
    }
  };

  if (searchInput) {
    searchInput.addEventListener('input', updateResults);
  }

  filters.forEach(filterId => {
    const element = document.getElementById(filterId);
    if (element) {
      element.addEventListener('change', updateResults);
    }
  });

  // Initial render
  updateResults();
}

// ============================================
// STAR RATING SELECTOR (for forms)
// ============================================

function createRatingSelector(name = 'rating', initialRating = 0) {
  return `
    <div class="rating-selector" style="display: flex; gap: 0.5rem; font-size: 1.5rem;">
      ${[1, 2, 3, 4, 5].map(star => `
        <button type="button" 
                class="rating-star ${star <= initialRating ? 'active' : ''}" 
                data-value="${star}"
                onclick="setRating(${star}, event)"
                style="background: none; border: none; cursor: pointer; padding: 0;">
          ★
        </button>
      `).join('')}
      <input type="hidden" name="${name}" id="${name}-input" value="${initialRating}">
    </div>
  `;
}

function setRating(star, event) {
  event.preventDefault();
  const stars = event.target.parentElement.querySelectorAll('.rating-star');
  const input = event.target.parentElement.querySelector('[type="hidden"]');
  
  stars.forEach((s, index) => {
    if (index < star) {
      s.classList.add('active');
      s.style.color = 'var(--primary)';
    } else {
      s.classList.remove('active');
      s.style.color = 'inherit';
    }
  });
  
  input.value = star;
}

// ============================================
// FORM VALIDATION
// ============================================

function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validateForm(formData) {
  const errors = {};

  if (!formData.name || formData.name.trim() === '') {
    errors.name = 'Name is required';
  }

  if (!formData.email || formData.email.trim() === '') {
    errors.email = 'Email is required';
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Invalid email format';
  }

  if (formData.password && formData.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return errors;
}

// ============================================
// REVIEW RENDERING
// ============================================

function createReviewItem(review) {
  return `
    <div class="review-item">
      <div class="review-header">
        <div>
          <div class="review-author">${review.userName}</div>
          <div class="review-date">${review.date}</div>
        </div>
      </div>
      <div class="review-rating">${renderStars(review.rating)} ${review.rating}/5</div>
      <div class="review-text">${review.comment}</div>
      <div class="review-helpful">👍 ${review.helpfulCount} found this helpful</div>
    </div>
  `;
}

function renderReviews(reviews, containerId = 'reviews-list') {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (reviews.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--muted-foreground);">No reviews yet. Be the first to review!</p>';
    return;
  }

  container.innerHTML = reviews.map(review => createReviewItem(review)).join('');
}

// ============================================
// URL PARAMETERS
// ============================================

function getUrlParam(param) {
  const params = new URLSearchParams(window.location.search);
  return params.get(param);
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', setupHeader);
