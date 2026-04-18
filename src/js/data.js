// ============================================
// MAPA-Sarap: Mock Data
// ============================================

const restaurants = [
  {
    id: 1,
    name: "Tita's Kitchen",
    cuisine: "Filipino",
    rating: 4.8,
    reviewCount: 124,
    address: "123 MacArthur Highway, Angeles City",
    distance: "0.3 km",
    priceRange: "$$",
    status: "Open",
    imageUrl: "https://picsum.photos/400/300?random=1", // Reliable placeholder
    lat: 15.1333,
    lng: 120.5900,
    hours: "8:00 AM - 9:00 PM",
    phone: "+63 912 345 6789",
    description: "Authentic Filipino home-cooked meals with a modern twist.",
    popularDishes: ["Adobo", "Sinigang", "Kare-Kare"],
    amenities: ["WiFi", "Parking", "Aircon"]
  },
  {
    id: 2,
    name: "Samgyup House",
    cuisine: "Korean BBQ",
    rating: 4.6,
    reviewCount: 89,
    address: "456 Friendship Highway, Angeles City",
    distance: "0.8 km",
    priceRange: "$$$",
    status: "Open",
    imageUrl: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=800",
    lat: 15.135,
    lng: 120.592,
    hours: "11:00 AM - 11:00 PM",
    phone: "+63 912 345 6790",
    description: "Premium Korean BBQ experience with unlimited samgyupsal. Grill your own meat at the table while enjoying a variety of side dishes and sauces.",
    popularDishes: ["Samgyupsal", "Bulgogi", "Kimchi Stew"],
    amenities: ["WiFi", "Parking", "Private Rooms"]
  },
  {
    id: 3,
    name: "Pasta Bella",
    cuisine: "Italian",
    rating: 4.5,
    reviewCount: 67,
    address: "789 Balibago, Angeles City",
    distance: "1.2 km",
    priceRange: "$$",
    status: "Closed",
    imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800",
    lat: 15.138,
    lng: 120.595,
    hours: "10:00 AM - 10:00 PM",
    phone: "+63 912 345 6791",
    description: "Authentic Italian pasta and pizza in a cozy setting. Made with imported ingredients and traditional recipes passed down through generations.",
    popularDishes: ["Carbonara", "Margherita Pizza", "Tiramisu"],
    amenities: ["WiFi", "Outdoor Seating", "Pet Friendly"]
  },
  {
    id: 4,
    name: "Burger Shack",
    cuisine: "American",
    rating: 4.7,
    reviewCount: 156,
    address: "321 Fields Avenue, Angeles City",
    distance: "0.5 km",
    priceRange: "$",
    status: "Open",
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
    lat: 15.134,
    lng: 120.591,
    hours: "10:00 AM - 12:00 AM",
    phone: "+63 912 345 6792",
    description: "Juicy burgers, crispy fries, and thick shakes. A casual dining spot perfect for quick bites and hangouts with friends.",
    popularDishes: ["Cheeseburger", "Bacon Fries", "Milkshake"],
    amenities: ["WiFi", "24/7", "Delivery"]
  },
  {
    id: 5,
    name: "Sushi Express",
    cuisine: "Japanese",
    rating: 4.9,
    reviewCount: 203,
    address: "654 Korea Town, Angeles City",
    distance: "1.5 km",
    priceRange: "$$$",
    status: "Open",
    imageUrl: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800",
    lat: 15.14,
    lng: 120.598,
    hours: "11:30 AM - 2:30 PM, 5:30 PM - 10:00 PM",
    phone: "+63 912 345 6793",
    description: "Fresh sushi and authentic Japanese cuisine. All sushi is prepared fresh daily by our expert sushi chefs using the finest ingredients.",
    popularDishes: ["Salmon Sashimi", "Dragon Roll", "Ramen"],
    amenities: ["WiFi", "Tatami Room", "Sake Bar"]
  },
  {
    id: 6,
    name: "Café Aroma",
    cuisine: "Café",
    rating: 4.4,
    reviewCount: 98,
    address: "234 Mabini Street, Angeles City",
    distance: "0.7 km",
    priceRange: "$",
    status: "Open",
    imageUrl: "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800",
    lat: 15.132,
    lng: 120.589,
    hours: "7:00 AM - 8:00 PM",
    phone: "+63 912 345 6794",
    description: "Cozy café with specialty coffee and pastries. Perfect for studying, working, or catching up with friends over a warm cup of coffee.",
    popularDishes: ["Cappuccino", "Croissant", "Tiramisu Cake"],
    amenities: ["WiFi", "Charging Stations", "Outdoor Seating"]
  },
  {
    id: 7,
    name: "Thaicafe",
    cuisine: "Thai",
    rating: 4.5,
    reviewCount: 102,
    address: "987 Sapang Bato, Angeles City",
    distance: "1.8 km",
    priceRange: "$$",
    status: "Open",
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
    lat: 15.145,
    lng: 120.600,
    hours: "10:00 AM - 11:00 PM",
    phone: "+63 912 345 6795",
    description: "Authentic Thai cuisine with bold flavors and aromatic spices. From pad thai to curries, experience the taste of Thailand right here.",
    popularDishes: ["Pad Thai", "Green Curry", "Tom Yum Soup"],
    amenities: ["WiFi", "Parking", "Private Rooms"]
  },
  {
    id: 8,
    name: "Kebab Palace",
    cuisine: "Middle Eastern",
    rating: 4.6,
    reviewCount: 76,
    address: "555 Clarkton, Angeles City",
    distance: "0.4 km",
    priceRange: "$",
    status: "Open",
    imageUrl: "https://images.unsplash.com/photo-1599301881399-5a1a4cec9f0e?w=800",
    lat: 15.131,
    lng: 120.588,
    hours: "11:00 AM - 10:00 PM",
    phone: "+63 912 345 6796",
    description: "Delicious kebabs and Middle Eastern specialties. Handcrafted with fresh ingredients and marinated to perfection.",
    popularDishes: ["Chicken Kebab", "Shawarma", "Falafel Wrap"],
    amenities: ["WiFi", "Takeout", "Delivery"]
  }
];

const reviews = [
  {
    id: 1,
    restaurantId: 1,
    userName: "Maria Santos",
    rating: 5,
    comment: "Best adobo I've ever had! The meat is so tender and flavorful. Definitely coming back!",
    date: "2 days ago",
    helpfulCount: 24
  },
  {
    id: 2,
    restaurantId: 1,
    userName: "Juan dela Cruz",
    rating: 4,
    comment: "Good food and great service. A bit pricey but worth it for the quality.",
    date: "1 week ago",
    helpfulCount: 15
  },
  {
    id: 3,
    restaurantId: 2,
    userName: "Anna Lee",
    rating: 5,
    comment: "Amazing samgyupsal! Fresh meat and plenty of side dishes. The staff is very attentive.",
    date: "3 days ago",
    helpfulCount: 18
  },
  {
    id: 4,
    restaurantId: 2,
    userName: "Carlo Reyes",
    rating: 4,
    comment: "Great experience grilling your own meat. A bit crowded during weekends though.",
    date: "1 week ago",
    helpfulCount: 12
  },
  {
    id: 5,
    restaurantId: 4,
    userName: "Miguel Torres",
    rating: 5,
    comment: "The burgers here are incredible! Juicy, flavorful, and reasonably priced.",
    date: "5 days ago",
    helpfulCount: 31
  },
  {
    id: 6,
    restaurantId: 4,
    userName: "Sofia Garcia",
    rating: 4,
    comment: "Good burgers but the fries could be crispier. Still a solid spot for a quick meal.",
    date: "2 weeks ago",
    helpfulCount: 8
  },
  {
    id: 7,
    restaurantId: 5,
    userName: "David Kim",
    rating: 5,
    comment: "Freshest sushi in the city! The sushi chefs really know their craft.",
    date: "4 days ago",
    helpfulCount: 27
  },
  {
    id: 8,
    restaurantId: 6,
    userName: "Lisa Chen",
    rating: 4,
    comment: "Lovely café with great coffee and pastries. Perfect for studying.",
    date: "3 days ago",
    helpfulCount: 19
  }
];

// Helper functions
function getCuisines() {
  const cuisines = ["All", ...new Set(restaurants.map(r => r.cuisine))];
  return cuisines;
}

function getStats() {
  const totalRestaurants = restaurants.length;
  const avgRating = (restaurants.reduce((sum, r) => sum + r.rating, 0) / restaurants.length).toFixed(1);
  const totalReviews = reviews.length;
  const topRatedCount = restaurants.filter(r => r.rating >= 4.7).length;
  
  return {
    totalRestaurants,
    avgRating,
    totalReviews,
    topRatedCount
  };
}

function getRestaurantById(id) {
  return restaurants.find(r => r.id === parseInt(id));
}

function getReviewsByRestaurantId(restaurantId) {
  return reviews.filter(r => r.restaurantId === restaurantId);
}

function getTopRatedRestaurants() {
  return restaurants.sort((a, b) => b.rating - a.rating);
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    restaurants,
    reviews,
    getCuisines,
    getStats,
    getRestaurantById,
    getReviewsByRestaurantId,
    getTopRatedRestaurants
  };
}
