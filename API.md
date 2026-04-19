# MAPA-Sarap API Documentation

## Overview
The MAPA-Sarap backend consists of Vercel serverless functions that fetch data from a PostgreSQL database and serve it to the frontend via REST API endpoints.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables in Vercel
Add the following to your Vercel project settings (Settings → Environment Variables):

```
DATABASE_URL=postgresql://username:password@host:port/database_name
```

Typically for Vercel PostgreSQL, it looks like:
```
DATABASE_URL=postgresql://user:password@db.region.vercel-postgres.com:5432/dbname?sslmode=require
```

### 3. Deploy to Vercel
```bash
vercel deploy
```

## API Endpoints

### GET `/api/restaurants`
Returns all restaurants with computed ratings and review counts.

**Query Parameters:**
- `cuisine` (optional): Filter by cuisine type
- `priceRange` (optional): Filter by price range ($, $$, $$$)
- `minRating` (optional): Minimum rating threshold
- `openOnly` (optional): Return only open restaurants (true/false)

**Example Requests:**
```javascript
// Get all restaurants
fetch('/api/restaurants')

// Filter by cuisine
fetch('/api/restaurants?cuisine=Korean')

// Filter by price and rating
fetch('/api/restaurants?priceRange=$&minRating=4.5&openOnly=true')
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Jollibee AUF",
    "cuisine": "Filipino Fast Food",
    "description": "...",
    "address": "...",
    "lat": 15.144,
    "lng": 120.595,
    "priceRange": "$",
    "phone": "+63 45 888 1234",
    "website": "https://...",
    "imageUrl": "https://...",
    "hours": "7:00 AM - 10:00 PM",
    "status": "Open",
    "rating": 4.5,
    "reviewCount": 2,
    "distance": "0.1 km",
    "amenities": ["Drive Thru", "Delivery"],
    "popularDishes": ["Chickenjoy", "Jolly Spaghetti"]
  }
]
```

---

### GET `/api/reviews`
Returns reviews for a specific restaurant with user and rating information.

**Query Parameters:**
- `placeId` (required): Restaurant ID

**Example Request:**
```javascript
fetch('/api/reviews?placeId=1')
```

**Response:**
```json
[
  {
    "id": 1,
    "restaurantId": 1,
    "userName": "marias",
    "rating": 5,
    "comment": "Chickenjoy is still the best...",
    "date": "2026-04-14T08:30:00.000Z",
    "helpfulCount": 12
  }
]
```

---

### GET `/api/dishes`
Returns all dishes for a specific restaurant.

**Query Parameters:**
- `placeId` (required): Restaurant ID

**Example Request:**
```javascript
fetch('/api/dishes?placeId=1')
```

**Response:**
```json
[
  {
    "id": 1,
    "place_id": 1,
    "name": "Chickenjoy",
    "description": "Crispy fried chicken with gravy.",
    "price": 95.00,
    "image_url": "..."
  }
]
```

---

### GET `/api/amenities`
Returns all amenities for a specific restaurant.

**Query Parameters:**
- `placeId` (required): Restaurant ID

**Example Request:**
```javascript
fetch('/api/amenities?placeId=1')
```

**Response:**
```json
[
  "Drive Thru",
  "Delivery"
]
```

---

### GET `/api/stats`
Returns aggregated statistics across all restaurants.

**Example Request:**
```javascript
fetch('/api/stats')
```

**Response:**
```json
{
  "totalRestaurants": 4,
  "avgRating": 4.4,
  "totalReviews": 4,
  "totalRatings": 8
}
```

---

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `400`: Bad request (missing required parameters)
- `500`: Server error (database connection issues)

Error responses include a message:
```json
{
  "error": "Error description"
}
```

---

## Development

### Local Testing with Vercel CLI
```bash
vercel dev
```

This starts a local development server at `http://localhost:3000` with the API routes available at `/api/*`.

### Database Connection
The API automatically handles:
- SSL connections for production (Vercel PostgreSQL)
- Connection pooling via the `pg` library
- Fallback data if API is unreachable (served from frontend fallback)

---

## Frontend Integration

The frontend (`src/js/data.js`) automatically:
1. Detects if running on localhost or production
2. Fetches from the appropriate API base URL
3. Uses fallback seed data if API is unavailable
4. Caches restaurants in memory for filtering

All frontend helper functions use these API endpoints:
- `fetchRestaurants(filters)` - Fetch restaurants with optional filters
- `fetchReviews(placeId)` - Fetch reviews for a restaurant
- `fetchStats()` - Fetch global statistics
- `getDishesForRestaurant(restaurantId)` - Fetch dishes
- `getAmenitiesForRestaurant(restaurantId)` - Fetch amenities

---

## Deployment Checklist

- [ ] Create Vercel account and project
- [ ] Connect GitHub repository to Vercel
- [ ] Add `DATABASE_URL` environment variable
- [ ] Ensure `package.json` includes `pg` dependency
- [ ] Run `npm install` locally before pushing
- [ ] Verify API endpoints work: `vercel dev`
- [ ] Deploy to production: `vercel deploy --prod`
- [ ] Test all endpoints in production
- [ ] Monitor logs in Vercel dashboard
