-- Удаление таблиц, если они существуют
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS place_images;
DROP TABLE IF EXISTS places;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile_picture VARCHAR(255) DEFAULT 'default-user.png',
    role VARCHAR(20) DEFAULT 'user',
    blocked BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create places table
CREATE TABLE places (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    address VARCHAR(255),
    location VARCHAR(255), -- City, Country
    category VARCHAR(50),
    phone VARCHAR(50),
    website VARCHAR(255),
    hours VARCHAR(100),
    rating DECIMAL(2, 1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create images table for places
CREATE TABLE place_images (
    id SERIAL PRIMARY KEY,
    place_id INTEGER REFERENCES places(id) ON DELETE CASCADE,
    image_url VARCHAR(255) NOT NULL
);

-- Create reviews table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    place_id INTEGER REFERENCES places(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create favorites table
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    place_id INTEGER REFERENCES places(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, place_id)
);

-- Примечание: Пользователи теперь определены прямо в коде приложения
-- Admin: admin@example.com / admin123 (роль: admin)
-- User: user@example.com / user123 (роль: user)

-- Insert some default places
INSERT INTO places (name, description, address, location, category, phone, website, hours, rating) 
VALUES 
('Central Park', 'A beautiful urban park in the heart of the city. Features include walking paths, a lake, and various recreational activities.', '123 Park Avenue, City Center', 'New York, USA', 'Parks', '+1 (123) 456-7890', 'www.centralpark.com', 'Open 24 hours', 4.8),
('Louvre Museum', 'One of the world''s largest art museums and a historic monument.', 'Rue de Rivoli, 75001', 'Paris, France', 'Museums', '+33 1 40 20 50 50', 'www.louvre.fr', '9:00 AM - 6:00 PM, Closed on Tuesdays', 4.9),
('Coffee House', 'Cozy café offering a variety of coffee drinks, pastries, and light meals.', '45 Main Street', 'Vienna, Austria', 'Cafes', '+43 1 234 5678', 'www.viennacoffeehouse.com', '7:00 AM - 10:00 PM', 4.5),
('Grand Plaza Hotel', 'Luxury 5-star hotel offering exceptional service, elegant rooms, and state-of-the-art facilities.', 'Sheikh Zayed Road', 'Dubai, UAE', 'Hotels', '+971 4 123 4567', 'www.grandplazadubai.com', 'Check-in: 2:00 PM, Check-out: 12:00 PM', 4.7),
('Mountain View', 'Breathtaking natural site offering panoramic views of the Alps.', 'Alpine Route 25', 'Alps, Switzerland', 'Nature', '+41 77 123 4567', 'www.swissalps-view.ch', 'Accessible from 7:00 AM - 9:00 PM', 4.9),
('City Mall', 'Modern shopping center featuring over 200 stores, restaurants, and entertainment options.', '789 Orchard Road', 'Singapore', 'Shopping', '+65 6123 4567', 'www.citymallsingapore.com', '10:00 AM - 10:00 PM', 4.4);

-- Insert some default images for places
INSERT INTO place_images (place_id, image_url) 
VALUES 
(1, 'https://images.unsplash.com/photo-1534251369789-5067c8b8602a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'),
(2, 'https://images.unsplash.com/photo-1597923739822-a0847a3a3768?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'),
(3, 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'),
(4, 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'),
(5, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'),
(6, 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'); 