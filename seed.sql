-- MAPA-Sarap seed data
-- Run after schema.sql

BEGIN;

TRUNCATE TABLE review_images, dish_reviews, place_amenities, ratings, reviews, dishes, places, users RESTART IDENTITY CASCADE;

-- USERS
INSERT INTO users (id, username, email, password_hash, role)
VALUES
(1, 'marias', 'maria@example.com', 'demo-hash-1', 'user'),
(2, 'juancruz', 'juan@example.com', 'demo-hash-2', 'user'),
(3, 'annalee', 'anna@example.com', 'demo-hash-3', 'user'),
(4, 'carlor', 'carlo@example.com', 'demo-hash-4', 'user'),
(5, 'sofiai', 'sofia@example.com', 'demo-hash-5', 'user');

-- PLACES
INSERT INTO places (id, name, cuisine, description, address, latitude, longitude, price_range, phone, website, image_url, opening_hours, is_open)
VALUES
(1, 'Jollibee AUF', 'Filipino Fast Food', 'Popular Filipino fast food chain known for fried chicken and spaghetti.', 'MacArthur Hwy, Angeles City, Pampanga', 15.144760266478606, 120.59528740862909, '$', '+63 45 888 1234', 'https://www.jollibee.com.ph', 'https://via.placeholder.com/600x400?text=Jollibee+AUF', '7:00 AM - 10:00 PM', TRUE),
(2, 'McDonald''s Angeles Intersection', 'American Fast Food', 'Global fast food chain offering burgers, fries, and breakfast meals.', 'MacArthur Hwy, Angeles City, Pampanga', 15.142816498032756, 120.59631362397157, '$', '+63 45 888 2234', 'https://www.mcdonalds.com.ph', 'https://via.placeholder.com/600x400?text=McDonalds+Angeles', '24 Hours', TRUE),
(3, '24 Chicken Angeles', 'Korean', 'Korean-style fried chicken with flavorful sauces.', 'Angeles City, Pampanga', 15.142285685420413, 120.59696079513589, '$$', '+63 45 888 3234', 'https://www.facebook.com/24chickenph', 'https://via.placeholder.com/600x400?text=24+Chicken+Angeles', '10:00 AM - 11:00 PM', TRUE),
(4, 'Wall Street Wraps AUF', 'Wraps and Rice Meals', 'Quick-service wraps and rice meals for students.', 'Near AUF, Angeles City, Pampanga', 15.144080578526435, 120.5957652922267, '$', '+63 45 888 4234', NULL, 'https://via.placeholder.com/600x400?text=Wall+Street+Wraps', '8:00 AM - 9:00 PM', TRUE);

-- DISHES
INSERT INTO dishes (place_id, name, description, price, image_url) VALUES
(1, 'Chickenjoy', 'Crispy fried chicken with gravy.', 95.00, 'https://via.placeholder.com/150'),
(1, 'Jolly Spaghetti', 'Sweet-style Filipino spaghetti.', 75.00, 'https://via.placeholder.com/150'),

(2, 'Big Mac', 'Classic double beef burger.', 150.00, 'https://via.placeholder.com/150'),
(2, 'McChicken', 'Chicken sandwich with mayo.', 120.00, 'https://via.placeholder.com/150'),

(3, 'Yangnyeom Chicken', 'Sweet and spicy Korean fried chicken.', 220.00, 'https://via.placeholder.com/150'),
(3, 'Snow Cheese Chicken', 'Chicken topped with cheese powder.', 230.00, 'https://via.placeholder.com/150'),

(4, 'Chicken Wrap', 'Grilled chicken in soft tortilla.', 120.00, 'https://via.placeholder.com/150'),
(4, 'Beef Rice Meal', 'Savory beef served with rice.', 130.00, 'https://via.placeholder.com/150');

-- PLACE AMENITIES
INSERT INTO place_amenities (place_id, amenity) VALUES
(1, 'Drive Thru'), (1, 'Delivery'),
(2, '24/7 Service'), (2, 'Drive Thru'),
(3, 'Takeout'), (3, 'Indoor Seating'),
(4, 'Student Meals'), (4, 'Takeout');

-- RATINGS
INSERT INTO ratings (user_id, place_id, rating) VALUES
(1, 1, 5), (2, 1, 4),
(1, 2, 4), (3, 2, 4),
(2, 3, 5), (4, 3, 5),
(1, 4, 4), (5, 4, 4);

-- REVIEWS
INSERT INTO reviews (user_id, place_id, review_text, helpful_count, created_at) VALUES
(1, 1, 'Chickenjoy is still the best comfort meal near campus.', 12, '2026-04-14 08:30:00'),
(2, 2, 'Fast service and reliable breakfast options before class.', 9, '2026-04-12 03:00:00'),
(3, 3, 'Great sauces and crispy chicken. Best with friends.', 14, '2026-04-15 10:00:00'),
(4, 4, 'Affordable wraps and rice bowls for students on a budget.', 6, '2026-04-13 05:40:00');

-- Keep sequence in sync after inserting explicit IDs.
SELECT setval('places_id_seq', COALESCE((SELECT MAX(id) FROM places), 1));
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1));
SELECT setval('dishes_id_seq', COALESCE((SELECT MAX(id) FROM dishes), 1));
SELECT setval('ratings_id_seq', COALESCE((SELECT MAX(id) FROM ratings), 1));
SELECT setval('reviews_id_seq', COALESCE((SELECT MAX(id) FROM reviews), 1));
SELECT setval('place_amenities_id_seq', COALESCE((SELECT MAX(id) FROM place_amenities), 1));

COMMIT;
