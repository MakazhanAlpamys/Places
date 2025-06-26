const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/authMiddleware');
const checkAdminRole = require('../middleware/checkAdminRole');

// Get all places with images
router.get('/', async (req, res) => {
  try {
    // Get query parameters
    const { category, search } = req.query;
    let query = `
      SELECT 
        p.id, p.name, p.description, p.address, p.location, p.category, 
        p.phone, p.website, p.hours, p.rating, p.created_at,
        COALESCE(json_agg(pi.image_url) FILTER (WHERE pi.id IS NOT NULL), '[]') AS images
      FROM places p
      LEFT JOIN place_images pi ON p.id = pi.place_id
    `;
    
    // Add filters if any
    const queryParams = [];
    const conditions = [];
    
    if (category && category !== 'all') {
      queryParams.push(category);
      conditions.push(`p.category ILIKE $${queryParams.length}`);
    }
    
    if (search) {
      queryParams.push(`%${search}%`);
      conditions.push(`(
        p.name ILIKE $${queryParams.length} OR 
        p.description ILIKE $${queryParams.length} OR 
        p.location ILIKE $${queryParams.length}
      )`);
    }
    
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    // Group by place id
    query += ' GROUP BY p.id ORDER BY p.rating DESC';
    
    const result = await db.query(query, queryParams);
    
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Специальный маршрут для формы добавления нового места
router.get('/add', authenticateToken, checkAdminRole, (req, res) => {
  console.log('Запрос на форму добавления нового места от', req.user.username);
  // Этот маршрут будет обрабатывать GET запрос к /places/add
  res.json({ message: 'Форма для добавления нового места' });
});

// Get user's favorite places
router.get('/favorites/me', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        p.id, p.name, p.description, p.address, p.location, p.category, 
        p.phone, p.website, p.hours, p.rating, p.created_at,
        COALESCE(json_agg(pi.image_url) FILTER (WHERE pi.id IS NOT NULL), '[]') AS images
      FROM favorites f
      JOIN places p ON f.place_id = p.id
      LEFT JOIN place_images pi ON p.id = pi.place_id
      WHERE f.user_id = $1
      GROUP BY p.id, f.created_at
      ORDER BY f.created_at DESC
    `;
    
    const result = await db.query(query, [req.user.id]);
    
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a new place (admin only)
router.post('/', authenticateToken, checkAdminRole, async (req, res) => {
  const { 
    name, 
    description, 
    address, 
    location, 
    category, 
    phone, 
    website, 
    hours, 
    images 
  } = req.body;
  
  if (!name || !description || !address || !location || !category) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  if (!images || !Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ error: 'At least one image is required' });
  }
  
  try {
    console.log('Добавление нового места:', name);
    
    // Begin transaction
    await db.query('BEGIN');
    
    // Insert place
    const placeResult = await db.query(
      `INSERT INTO places 
        (name, description, address, location, category, phone, website, hours) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [name, description, address, location, category, phone, website, hours]
    );
    
    const place = placeResult.rows[0];
    
    // Insert images
    for (const imageUrl of images) {
      await db.query(
        'INSERT INTO place_images (place_id, image_url) VALUES ($1, $2)',
        [place.id, imageUrl]
      );
    }
    
    // Commit transaction
    await db.query('COMMIT');
    
    // Get place with images
    const finalPlace = await db.query(
      `SELECT 
        p.*, 
        COALESCE(json_agg(pi.image_url) FILTER (WHERE pi.id IS NOT NULL), '[]') AS images
      FROM places p
      LEFT JOIN place_images pi ON p.id = pi.place_id
      WHERE p.id = $1
      GROUP BY p.id`,
      [place.id]
    );
    
    console.log('Место успешно добавлено, ID:', place.id);
    res.status(201).json(finalPlace.rows[0]);
  } catch (err) {
    // Rollback transaction on error
    await db.query('ROLLBACK');
    console.error('Ошибка при добавлении места:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get place by id with images and reviews
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Проверяем, что id - это число
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return res.status(400).json({ error: 'Invalid place ID, must be a number' });
    }
    
    // Get place with images
    const placeQuery = `
      SELECT 
        p.id, p.name, p.description, p.address, p.location, p.category, 
        p.phone, p.website, p.hours, p.rating, p.created_at,
        COALESCE(json_agg(pi.image_url) FILTER (WHERE pi.id IS NOT NULL), '[]') AS images
      FROM places p
      LEFT JOIN place_images pi ON p.id = pi.place_id
      WHERE p.id = $1
      GROUP BY p.id
    `;
    
    const placeResult = await db.query(placeQuery, [numericId]);
    
    if (placeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Place not found' });
    }
    
    const place = placeResult.rows[0];
    
    // Get reviews for place
    const reviewsQuery = `
      SELECT 
        r.id, r.rating, r.comment, r.created_at,
        json_build_object(
          'id', u.id,
          'username', u.username,
          'profile_picture', u.profile_picture
        ) as user
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.place_id = $1
      ORDER BY r.created_at DESC
    `;
    
    const reviewsResult = await db.query(reviewsQuery, [numericId]);
    place.reviews = reviewsResult.rows;
    
    res.json(place);
  } catch (err) {
    console.error('Error getting place by id:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a review to a place
router.post('/:id/reviews', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user.id;
  
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }
  
  try {
    // Begin transaction
    await db.query('BEGIN');
    
    // Check if place exists
    const placeResult = await db.query('SELECT * FROM places WHERE id = $1', [id]);
    if (placeResult.rows.length === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ error: 'Place not found' });
    }
    
    // Check if user already reviewed this place
    const existingReview = await db.query(
      'SELECT * FROM reviews WHERE place_id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (existingReview.rows.length > 0) {
      await db.query('ROLLBACK');
      return res.status(400).json({ error: 'You have already reviewed this place' });
    }
    
    // Add review
    const reviewResult = await db.query(
      'INSERT INTO reviews (place_id, user_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, userId, rating, comment]
    );
    
    // Update place rating
    const newRatingResult = await db.query(
      'SELECT AVG(rating)::numeric(2,1) as avg_rating FROM reviews WHERE place_id = $1',
      [id]
    );
    
    const avgRating = newRatingResult.rows[0].avg_rating;
    
    await db.query(
      'UPDATE places SET rating = $1 WHERE id = $2',
      [avgRating, id]
    );
    
    // Commit transaction
    await db.query('COMMIT');
    
    // Get user info
    const userResult = await db.query(
      'SELECT id, username, profile_picture FROM users WHERE id = $1',
      [userId]
    );
    
    const review = {
      ...reviewResult.rows[0],
      user: userResult.rows[0]
    };
    
    res.status(201).json(review);
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add place to favorites
router.post('/:id/favorite', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  try {
    // Проверяем, что id - это число
    const placeId = parseInt(id, 10);
    if (isNaN(placeId)) {
      return res.status(400).json({ error: 'Invalid place ID' });
    }
    
    // Begin transaction
    await db.query('BEGIN');
    
    // Check if place exists
    const placeResult = await db.query('SELECT * FROM places WHERE id = $1', [placeId]);
    if (placeResult.rows.length === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ error: 'Place not found' });
    }
    
    // Check if already in favorites
    const favoriteExists = await db.query(
      'SELECT * FROM favorites WHERE place_id = $1 AND user_id = $2',
      [placeId, userId]
    );
    
    if (favoriteExists.rows.length > 0) {
      await db.query('ROLLBACK');
      return res.status(400).json({ error: 'Place already in favorites' });
    }
    
    // Add to favorites
    await db.query(
      'INSERT INTO favorites (place_id, user_id) VALUES ($1, $2)',
      [placeId, userId]
    );
    
    // Commit transaction
    await db.query('COMMIT');
    
    res.status(201).json({ message: 'Place added to favorites' });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error('Error adding place to favorites:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove place from favorites
router.delete('/:id/favorite', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  try {
    // Проверяем, что id - это число
    const placeId = parseInt(id, 10);
    if (isNaN(placeId)) {
      return res.status(400).json({ error: 'Invalid place ID' });
    }
    
    // Remove from favorites
    const result = await db.query(
      'DELETE FROM favorites WHERE place_id = $1 AND user_id = $2 RETURNING *',
      [placeId, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Place not found in favorites' });
    }
    
    res.json({ message: 'Place removed from favorites' });
  } catch (err) {
    console.error('Error removing place from favorites:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a place (admin only)
router.delete('/:id', authenticateToken, checkAdminRole, async (req, res) => {
  const { id } = req.params;
  
  try {
    // Проверяем, что id - это число
    const placeId = parseInt(id, 10);
    if (isNaN(placeId)) {
      return res.status(400).json({ error: 'Invalid place ID' });
    }
    
    console.log(`Удаление места с ID: ${placeId}`);
    
    // Begin transaction
    await db.query('BEGIN');
    
    // Check if place exists
    const placeResult = await db.query('SELECT * FROM places WHERE id = $1', [placeId]);
    if (placeResult.rows.length === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ error: 'Place not found' });
    }
    
    // Delete related records first
    // 1. Delete place images
    await db.query('DELETE FROM place_images WHERE place_id = $1', [placeId]);
    console.log(`Удалены изображения для места ${placeId}`);
    
    // 2. Delete reviews
    await db.query('DELETE FROM reviews WHERE place_id = $1', [placeId]);
    console.log(`Удалены отзывы для места ${placeId}`);
    
    // 3. Delete from favorites
    await db.query('DELETE FROM favorites WHERE place_id = $1', [placeId]);
    console.log(`Удалено из избранного для места ${placeId}`);
    
    // 4. Finally delete the place
    const deleteResult = await db.query('DELETE FROM places WHERE id = $1 RETURNING id', [placeId]);
    
    // Commit transaction
    await db.query('COMMIT');
    
    if (deleteResult.rows.length === 0) {
      // Should not happen due to check above, but just in case
      return res.status(404).json({ error: 'Place not found' });
    }
    
    console.log(`Место с ID ${placeId} успешно удалено`);
    res.json({ message: 'Place deleted successfully', id: placeId });
  } catch (err) {
    // Rollback transaction on error
    await db.query('ROLLBACK');
    console.error(`Ошибка при удалении места с ID ${id}:`, err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 