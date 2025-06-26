const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const dotenv = require('dotenv');

// Загрузка переменных окружения
dotenv.config();

// Создание пула подключений
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Тестовые данные
const users = [
  {
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    username: 'user1',
    email: 'user1@example.com',
    password: 'password123',
    role: 'user'
  },
  {
    username: 'user2',
    email: 'user2@example.com',
    password: 'password123',
    role: 'user'
  }
];

const places = [
  {
    name: 'Central Park',
    description: 'A beautiful urban park in the heart of the city. Features include walking paths, a lake, and various recreational activities.',
    address: '123 Park Avenue, City Center',
    location: 'New York, USA',
    category: 'Parks',
    phone: '+1 (123) 456-7890',
    website: 'www.centralpark.com',
    hours: 'Open 24 hours',
    images: [
      'https://images.unsplash.com/photo-1534251369789-5067c8b8602a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1500731259906-8e5ef35d59e3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1573155993874-d5d48af862ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    name: 'Louvre Museum',
    description: 'One of the world\'s largest art museums and a historic monument. Home to thousands of works of art, including the Mona Lisa.',
    address: 'Rue de Rivoli, 75001',
    location: 'Paris, France',
    category: 'Museums',
    phone: '+33 1 40 20 50 50',
    website: 'www.louvre.fr',
    hours: '9:00 AM - 6:00 PM, Closed on Tuesdays',
    images: [
      'https://images.unsplash.com/photo-1597923739822-a0847a3a3768?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1565639874687-2d3d1675d51a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1618233691823-dde3e3a04b4d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    name: 'Coffee House',
    description: 'Cozy café offering a variety of coffee drinks, pastries, and light meals. Perfect for working, reading, or meeting friends.',
    address: '45 Main Street',
    location: 'Vienna, Austria',
    category: 'Cafes',
    phone: '+43 1 234 5678',
    website: 'www.viennacoffeehouse.com',
    hours: '7:00 AM - 10:00 PM',
    images: [
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1530174883092-c2a7aa3f1cfe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    name: 'Grand Plaza Hotel',
    description: 'Luxury 5-star hotel offering exceptional service, elegant rooms, and state-of-the-art facilities. Features include a rooftop pool, spa, and fine dining restaurants.',
    address: 'Sheikh Zayed Road',
    location: 'Dubai, UAE',
    category: 'Hotels',
    phone: '+971 4 123 4567',
    website: 'www.grandplazadubai.com',
    hours: 'Check-in: 2:00 PM, Check-out: 12:00 PM',
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    name: 'Mountain View',
    description: 'Breathtaking natural site offering panoramic views of the Alps. Popular for hiking in summer and skiing in winter, with well-maintained trails and facilities.',
    address: 'Alpine Route 25',
    location: 'Alps, Switzerland',
    category: 'Nature',
    phone: '+41 77 123 4567',
    website: 'www.swissalps-view.ch',
    hours: 'Accessible from 7:00 AM - 9:00 PM (seasonal variations)',
    images: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1458442310124-dde6edb43d10?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    name: 'City Mall',
    description: 'Modern shopping center featuring over 200 stores, restaurants, and entertainment options. Home to both local and international brands.',
    address: '789 Orchard Road',
    location: 'Singapore',
    category: 'Shopping',
    phone: '+65 6123 4567',
    website: 'www.citymallsingapore.com',
    hours: '10:00 AM - 10:00 PM',
    images: [
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1579975096649-e773e7f23704?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1555529771-122e5d9f2341?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ]
  }
];

// Функция для заполнения базы данных
async function seedDatabase() {
  try {
    console.log('Начало заполнения базы данных...');

    // Начало транзакции
    await pool.query('BEGIN');

    console.log('Очистка существующих данных...');
    // Удаление существующих данных
    await pool.query('DELETE FROM favorites');
    await pool.query('DELETE FROM reviews');
    await pool.query('DELETE FROM place_images');
    await pool.query('DELETE FROM places');
    await pool.query('DELETE FROM users');

    console.log('Добавление пользователей...');
    // Добавление пользователей
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await pool.query(
        'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)',
        [user.username, user.email, hashedPassword, user.role]
      );
    }

    console.log('Добавление мест...');
    // Добавление мест и их изображений
    for (const place of places) {
      const placeResult = await pool.query(
        `INSERT INTO places 
          (name, description, address, location, category, phone, website, hours) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING id`,
        [place.name, place.description, place.address, place.location, place.category, place.phone, place.website, place.hours]
      );

      const placeId = placeResult.rows[0].id;

      // Добавление изображений для места
      for (const imageUrl of place.images) {
        await pool.query(
          'INSERT INTO place_images (place_id, image_url) VALUES ($1, $2)',
          [placeId, imageUrl]
        );
      }
    }

    // Завершение транзакции
    await pool.query('COMMIT');
    console.log('База данных успешно заполнена!');
  } catch (error) {
    // Откат транзакции в случае ошибки
    await pool.query('ROLLBACK');
    console.error('Ошибка при заполнении базы данных:', error);
  } finally {
    // Закрытие подключения к базе данных
    await pool.end();
  }
}

// Запуск функции заполнения базы данных
seedDatabase(); 