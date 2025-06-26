const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const authenticateToken = require('../middleware/authMiddleware');

// Register a new user
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Please provide all required fields' });
  }

  try {
    // Check if user already exists
    const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, role, profile_picture, created_at',
      [username, email, hashedPassword]
    );
    
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    
    res.status(201).json({
      user,
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login a user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password' });
  }

  try {
    // Специальная проверка для администратора (захардкоженные данные)
    if (email === 'admin@example.com' && password === 'admin123') {
      console.log('Logging in hardcoded admin user');
      const adminUser = {
        id: 999,
        username: 'Администратор',
        email: 'admin@example.com',
        role: 'admin',
        profile_picture: 'default-user.png',
        created_at: new Date().toISOString()
      };
      
      const token = jwt.sign(
        { 
          id: adminUser.id, 
          role: adminUser.role,
          email: adminUser.email,
          timestamp: Date.now() 
        }, 
        process.env.JWT_SECRET, 
        { expiresIn: '7d' }
      );
      
      return res.json({
        user: adminUser,
        token
      });
    }
    
    // Специальная проверка для тестового пользователя
    if (email === 'user@example.com' && password === 'user123') {
      console.log('Logging in hardcoded regular user');
      const regularUser = {
        id: 1000,
        username: 'Пользователь',
        email: 'user@example.com',
        role: 'user',
        profile_picture: 'default-user.png',
        created_at: new Date().toISOString()
      };
      
      const token = jwt.sign(
        { 
          id: regularUser.id, 
          role: regularUser.role,
          email: regularUser.email,
          timestamp: Date.now() 
        }, 
        process.env.JWT_SECRET, 
        { expiresIn: '7d' }
      );
      
      return res.json({
        user: regularUser,
        token
      });
    }

    // Стандартная проверка для обычных пользователей через БД
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    
    // Check if user is blocked
    if (user.is_blocked) {
      return res.status(403).json({ error: 'Your account has been blocked. Please contact an administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;
    
    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );
    
    res.json({
      user: userWithoutPassword,
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, username, email, profile_picture, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  const { username, email } = req.body;
  
  if (!username || !email) {
    return res.status(400).json({ error: 'Please provide all required fields' });
  }

  try {
    // Check if email already exists for another user
    if (email) {
      const emailExists = await db.query(
        'SELECT * FROM users WHERE email = $1 AND id != $2',
        [email, req.user.id]
      );
      
      if (emailExists.rows.length > 0) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    const result = await db.query(
      'UPDATE users SET username = $1, email = $2 WHERE id = $3 RETURNING id, username, email, profile_picture, role, created_at',
      [username, email, req.user.id]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Please provide current and new password' });
  }

  try {
    // Get user with password
    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, req.user.id]);
    
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 