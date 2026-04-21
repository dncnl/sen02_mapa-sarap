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
// GEOLOCATION HELPERS
// ============================================

let userCoords = null;
const AUF_COORDS = { lat: 15.1442, lng: 120.5955 };

async function getUserLocation() {
  if (userCoords) return userCoords;
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("Geolocation not supported"));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };

        window.liveLocationCoordinates = userCoords;
        resolve(userCoords);
      },
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  });
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ============================================
// LOCAL STORAGE MANAGEMENT
// ============================================

const db = {
  getFavoritesKey() {
    const user = this.getUser();
    if (!user) return null;
    const userScope = user.id || user.username || user.email;
    return userScope ? `mapa-favorites-${userScope}` : null;
  },

  migrateLegacyFavorites() {
    const key = this.getFavoritesKey();
    if (!key) return;

    const alreadyScoped = localStorage.getItem(key);
    if (alreadyScoped) return;

    const legacy = localStorage.getItem('mapa-favorites');
    if (!legacy) return;

    try {
      const parsed = JSON.parse(legacy);
      if (Array.isArray(parsed)) {
        localStorage.setItem(key, JSON.stringify(parsed));
      }
    } catch (error) {
      // Ignore bad legacy data.
    }
  },

  getFavorites() {
    const key = this.getFavoritesKey();
    if (!key) return [];

    this.migrateLegacyFavorites();

    const favorites = localStorage.getItem(key);
    return favorites ? JSON.parse(favorites) : [];
  },

  saveFavorite(restaurantId) {
    const key = this.getFavoritesKey();
    if (!key) return;

    const favorites = this.getFavorites();
    if (!favorites.includes(restaurantId)) {
      favorites.push(restaurantId);
      localStorage.setItem(key, JSON.stringify(favorites));
    }
  },

  removeFavorite(restaurantId) {
    const key = this.getFavoritesKey();
    if (!key) return;

    const favorites = this.getFavorites();
    const filtered = favorites.filter(id => id !== restaurantId);
    localStorage.setItem(key, JSON.stringify(filtered));
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

  saveAuthSession(user, token) {
    this.saveUser(user);
    localStorage.setItem('mapa-token', token);
    // Backward compatibility for older builds that used a generic token key.
    localStorage.setItem('token', token);
  },

  getToken() {
    const token = localStorage.getItem('mapa-token')
      || localStorage.getItem('token')
      || localStorage.getItem('auth-token')
      || localStorage.getItem('mapa-auth-token');

    if (token && !localStorage.getItem('mapa-token')) {
      localStorage.setItem('mapa-token', token);
    }

    return token;
  },

  hasValidSession() {
    return this.getUser() !== null && !!this.getToken();
  },

  logout() {
    localStorage.removeItem('mapa-user');
    localStorage.removeItem('mapa-token');
    localStorage.removeItem('token');
    localStorage.removeItem('auth-token');
    localStorage.removeItem('mapa-auth-token');
  },

  isLoggedIn() {
    return this.hasValidSession();
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

function updateHeaderAuth() {
  const user = db.getUser();
  const token = db.getToken();
  const authContainer = document.querySelector('.header-actions');

  if (!authContainer) return;

  let html = '';

  if (user && token) {
    html = `
      <span class="text-sm text-muted-foreground">Hello, ${user.name || user.username || 'User'}!</span>
      <button class="btn btn-small btn-outline" onclick="logout()">Logout</button>
    `;
  } else {
    html = `
      <a href="${pagePaths.loginPath}" class="btn btn-small btn-primary">Login</a>
    `;
  }

  authContainer.innerHTML = html;
}

function logout() {
  db.logout();
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

function getUrlParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

function createRatingSelector(id, max = 5) {
  let html = `<div class="rating-input-container" style="display: flex; gap: 5px; font-size: 1.5rem; cursor: pointer;">`;
  for (let i = 1; i <= max; i++) {
    html += `<span class="star-input" data-value="${i}" onclick="setRating('${id}', ${i}, this)" style="color: #ccc;">☆</span>`;
  }
  html += `<input type="hidden" id="${id}-input" value="0"></div>`;
  return html;
}

window.setRating = (id, value, element) => {
  const container = element.parentElement;
  const stars = container.querySelectorAll('.star-input');
  const input = document.getElementById(`${id}-input`);
  input.value = value;
  stars.forEach((s, idx) => {
    s.textContent = idx < value ? '★' : '☆';
    s.style.color = idx < value ? '#f59e0b' : '#ccc';
  });
};

function renderReviews(reviewsList, containerId = 'reviews-list') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const user = db.getUser();
  const token = db.getToken();

  if (reviewsList.length === 0) {
    container.innerHTML = '<p class="text-muted-foreground">No reviews yet. Be the first to share your experience!</p>';
    return;
  }

  container.innerHTML = reviewsList.map(review => `
    <div class="review-item">
      <div class="review-header">
        <div class="review-author">${review.userName}</div>
        <div class="review-date">${new Date(review.date).toLocaleDateString()}</div>
      </div>
      <div class="review-rating">${renderStars(review.rating)}</div>
      <p class="review-text">${review.comment}</p>
      <div class="review-actions-row">
        <button
          type="button"
          class="review-helpful-btn ${review.hasHelpfulVote ? 'voted' : ''}"
          data-review-id="${review.id}"
          onclick="handleReviewHelpfulVote(this)"
          ${!user || !token ? 'disabled' : ''}
        >
          <span>${review.hasHelpfulVote ? 'Helpful' : 'Mark as helpful'}</span>
          <span class="review-helpful-count">(${review.helpfulCount || 0})</span>
        </button>
        ${(!user || !token)
          ? `<span class="review-helpful">Login to vote</span>`
          : ''}
      </div>
    </div>
  `).join('');
}

window.handleReviewHelpfulVote = async (button) => {
  const reviewId = parseInt(button?.dataset?.reviewId, 10);
  if (!Number.isInteger(reviewId) || reviewId <= 0) return;

  const token = db.getToken();
  if (!token) {
    window.location.href = pagePaths.loginPath;
    return;
  }

  const originalDisabled = button.disabled;
  button.disabled = true;

  try {
    const result = await toggleReviewHelpfulVote(reviewId, token);
    const voted = !!result.voted;
    const helpfulCount = Number(result.helpfulCount) || 0;

    button.classList.toggle('voted', voted);
    button.innerHTML = `
      <span>${voted ? 'Helpful' : 'Mark as helpful'}</span>
      <span class="review-helpful-count">(${helpfulCount})</span>
    `;
  } catch (error) {
    alert(error.message || 'Failed to update helpful vote');
  } finally {
    button.disabled = originalDisabled;
  }
};

// ============================================
// RESTAURANT CARD RENDERING
// ============================================

async function createRestaurantCard(restaurant) {
  const isFavorited = await db.isFavorite(restaurant.id);
  const isOpen = restaurant.status === 'Open';

  const fallbackImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect fill='%23e0e0e0' width='300' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='16' fill='%23999'%3E🍽️ No Image%3C/text%3E%3C/svg%3E";

  let distanceHtml = '';
  const locationRef = document.getElementById('location-reference')?.value || 'auf-main';
  const basisContext = getRestaurantFilterContext();
  const basisLocation = typeof basisContext.getBasisLocationById === 'function'
    ? basisContext.getBasisLocationById(locationRef)
    : null;
  
  // Determine which coordinates to use for display
  const refCoords = basisLocation || AUF_COORDS;
  const refLabel = basisLocation?.name || 'AUF';

  const dist = calculateDistance(refCoords.lat, refCoords.lng, restaurant.lat, restaurant.lng);
  const walkTime = Math.round((dist / 5) * 60);
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${restaurant.lat},${restaurant.lng}&travelmode=walking`;

  const distText = dist < 0.1 ? 'Steps away' : `${dist.toFixed(1)} km`;
  const timeText = walkTime < 1 ? '< 1 min walk' : `${walkTime} min walk`;

  distanceHtml = `
    <div style="margin-top: auto; padding-top: 1rem;">
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.6rem 0.8rem; background: var(--muted); border-radius: 10px; border: 1px solid var(--border);">
        <div style="display: flex; flex-direction: column; gap: 1px;">
          <div style="font-size: 0.8rem; font-weight: 800; color: var(--foreground); display: flex; align-items: center; gap: 4px;">
            📍 ${distText}
          </div>
          <div style="font-size: 0.6rem; color: var(--muted-foreground); font-weight: 600; text-transform: uppercase; letter-spacing: 0.025em;">
            ${refLabel} • ${timeText}
          </div>
        </div>
        <a href="${googleMapsUrl}" target="_blank" onclick="event.stopPropagation();" 
           style="background: white; color: var(--primary); font-size: 0.65rem; font-weight: 800; text-decoration: none; padding: 5px 12px; border-radius: 8px; border: 1px solid var(--border); box-shadow: 0 1px 2px rgba(0,0,0,0.05); white-space: nowrap;">
           Walk →
        </a>
      </div>
    </div>`;

  return `
    <div class="restaurant-card" onclick="window.location.href='${pagePaths.detailPath}?id=${restaurant.id}'" style="display: flex; flex-direction: column; height: 100%; transition: transform 0.2s; cursor: pointer;">
      <div style="position: relative; overflow: hidden; border-radius: 12px 12px 0 0;">
        <img src="${restaurant.imageUrl}" alt="${restaurant.name}" class="restaurant-image" style="height: 200px; width: 100%; object-fit: cover;" onerror="this.src='${fallbackImage}'">
        <div style="position: absolute; top: 12px; left: 12px; padding: 4px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.025em; text-transform: uppercase; box-shadow: 0 2px 4px rgba(0,0,0,0.1); background: ${isOpen ? '#22c55e' : '#ef4444'}; color: white; z-index: 2;">
          ${restaurant.status}
        </div>
        <button class="favorite-btn ${isFavorited ? 'active' : ''}" 
                style="position: absolute; top: 12px; right: 12px; background: rgba(255,255,255,0.9); border: none; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 2; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"
                onclick="event.stopPropagation(); toggleFavorite(${restaurant.id}, this)">
          <span style="font-size: 1.2rem; line-height: 1;">${isFavorited ? '♥' : '♡'}</span>
        </button>
      </div>
      <div class="restaurant-content" style="padding: 1.25rem; display: flex; flex-direction: column; flex-grow: 1;">
        <div class="restaurant-header" style="margin-bottom: 0.5rem;">
          <div class="restaurant-name" style="font-size: 1.15rem; font-weight: 700; color: var(--foreground);">${restaurant.name}</div>
        </div>
        <div class="restaurant-meta" style="display: flex; align-items: center; gap: 8px; margin-bottom: 0.75rem; font-size: 0.85rem;">
          <div style="display: flex; align-items: center; color: #f59e0b;">
            <span style="letter-spacing: -1px; margin-right: 4px;">${renderStars(restaurant.rating)}</span>
            <span style="font-weight: 700; color: var(--foreground);">${restaurant.rating}</span>
          </div>
          <span style="color: var(--muted-foreground);">(${restaurant.reviewCount})</span>
          <span style="margin-left: auto; font-weight: 600; color: var(--muted-foreground);">${restaurant.priceRange}</span>
        </div>
        <div style="font-size: 0.8rem; color: var(--muted-foreground); line-height: 1.4; margin-bottom: auto; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
          ${restaurant.address}
        </div>
        ${distanceHtml}
      </div>
    </div>`;
}

async function toggleFavorite(restaurantId, button) {
  const user = await db.getUser();
  if (!user) {
    alert('Please login to add favorites');
    window.location.href = pagePaths.loginPath;
    return;
  }

  const isCurrentlyFavorited = await db.isFavorite(restaurantId);

  if (isCurrentlyFavorited) {
    await db.removeFavorite(restaurantId);
    if (button.classList.contains('favorite-btn')) {
      button.textContent = '♡';
      button.classList.remove('active');
    } else {
      button.textContent = '♡ Add to Favorites';
      button.classList.remove('btn-primary');
      button.classList.add('btn-outline');
    }
  } else {
    await db.saveFavorite(restaurantId);
    if (button.classList.contains('favorite-btn')) {
      button.textContent = '♥';
      button.classList.add('active');
    } else {
      button.textContent = '♥ Favorited';
      button.classList.remove('btn-outline');
      button.classList.add('btn-primary');
    }
  }

  if (window.location.pathname.endsWith('/favorites.html') && typeof renderFavorites === 'function') {
    renderFavorites();
  }
}

// Backward-compat alias for pages still using `storage`.
const storage = db;

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

function getRestaurantFilterContext() {
  if (typeof window.getRestaurantFilterContext === 'function') {
    return window.getRestaurantFilterContext();
  }

  return {};
}

function filterRestaurants() {
  // Safety check: ensure the data layer has loaded the array
  if (!Array.isArray(restaurants)) return [];

  const searchQuery = document.getElementById('search-input')?.value || '';
  const selectedCuisine = document.getElementById('cuisine-filter')?.value || 'All';
  const selectedPrice = document.getElementById('price-filter')?.value || 'All';
  const selectedRating = parseFloat(document.getElementById('rating-filter')?.value || 0);
  const isOpenOnly = document.getElementById('open-only-filter')?.checked || false;
  const locationReference = document.getElementById('location-reference')?.value || 'auf-main';
  const radiusKm = parseFloat(document.getElementById('distance-slider')?.value || window.liveLocationRadiusKm || 5);

  const basisContext = getRestaurantFilterContext();
  const basisLocation = typeof basisContext.getBasisLocationById === 'function'
    ? basisContext.getBasisLocationById(locationReference)
    : null;
  const anchor = basisLocation || AUF_COORDS;

  const filtered = restaurants.filter(restaurant => {
    const matchesSearch = searchQuery === '' ||
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCuisine = selectedCuisine === 'All' || restaurant.cuisine === selectedCuisine;
    const matchesPrice = selectedPrice === 'All' || restaurant.priceRange === selectedPrice;
    const matchesRating = restaurant.rating >= selectedRating;
    const matchesOpenNow = !isOpenOnly || restaurant.status === 'Open';
    
    // Safe coordinate check
    const rLat = parseFloat(restaurant.lat || restaurant.latitude);
    const rLng = parseFloat(restaurant.lng || restaurant.longitude);
    const hasCoordinates = !isNaN(rLat) && !isNaN(rLng);

    // If restaurant has no coords, we show it anyway so it's not "invisible"
    const matchesDistance = !anchor || !hasCoordinates || 
      (calculateDistance(anchor.lat, anchor.lng, rLat, rLng) <= radiusKm);

    return matchesSearch && matchesCuisine && matchesPrice && matchesRating && matchesOpenNow && matchesDistance;
  });

  return filtered;
}

function setupFilters() {
  const searchInput = document.getElementById('search-input');
  const distanceSlider = document.getElementById('distance-slider');
  const distanceValueLabel = document.getElementById('distance-value');
  const filters = ['cuisine-filter', 'price-filter', 'rating-filter', 'open-only-filter', 'location-reference'];

  // Add a Reset Filters helper
  window.resetAllFilters = () => {
    if (searchInput) searchInput.value = '';
    if (distanceSlider) distanceSlider.value = 5;
    filters.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        if (el.type === 'checkbox') el.checked = false;
        else el.value = el.tagName === 'SELECT' ? (el.options[0].value || 'All') : '';
      }
    });
    updateResults();
  };

  const showLoadingState = () => {
    const container = document.getElementById('restaurants-grid');
    if (container) {
      container.style.opacity = '0.5';
      container.style.transition = 'opacity 0.2s';
    }
  };

  const updateResults = async () => {
    showLoadingState();
    const locationRef = document.getElementById('location-reference');
    const isLiveReference = locationRef && (locationRef.value === 'live-location' || locationRef.value === 'me');
    
    // If User chooses "Live Location", trigger permission prompt
    if (isLiveReference && !userCoords) {
      try {
        await getUserLocation();
        if (typeof updateLiveLocationMarker === 'function') {
          updateLiveLocationMarker();
        }
      } catch (err) {
        alert("Please enable location services to use the distance filter.");
        locationRef.value = 'auf-main';
      }
    }

    // Update the UI label for the slider
    if (distanceSlider && distanceValueLabel) {
      distanceValueLabel.textContent = `${parseFloat(distanceSlider.value).toFixed(1)} km`;
    }

    // Sync the active location badge in the UI
    if (typeof updateActiveBasisIndicator === 'function') {
      updateActiveBasisIndicator();
    }

    const filtered = filterRestaurants();
    setTimeout(async () => {
      await renderRestaurantGrid(filtered);
      const container = document.getElementById('restaurants-grid');
      if (container) container.style.opacity = '1';
    }, 100);
    
    if (typeof updateMapMarkers === 'function') {
      updateMapMarkers();
    }
  };

  window.refreshRestaurantResults = updateResults;

  if (searchInput) {
    searchInput.addEventListener('input', updateResults);
  }

  if (distanceSlider) {
    // Use 'input' event for real-time slider updates
    distanceSlider.addEventListener('input', updateResults);
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

// =============================
