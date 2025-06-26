const jwt = require('jsonwebtoken');
const pool = require('../db');

const jwtSecret = process.env.JWT_SECRET;

/**
 * Middleware аутентификации пользователя
 * Проверяет наличие и валидность JWT токена
 */
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('[authenticateToken] Токен не предоставлен');
    return res.status(401).json({ error: 'Требуется авторизация' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    console.log(`[authenticateToken] Токен верифицирован. User ID: ${decoded.id}`);

    // Проверка для хардкодированных пользователей
    if (decoded.id === 999 && decoded.email === 'admin@example.com') {
      req.user = {
        id: 999,
        username: 'Администратор',
        email: 'admin@example.com',
        role: 'admin',
        blocked: false
      };
      return next();
    }

    if (decoded.id === 1000 && decoded.email === 'user@example.com') {
      req.user = {
        id: 1000,
        username: 'Пользователь',
        email: 'user@example.com',
        role: 'user',
        blocked: false
      };
      return next();
    }

    // Для обычных пользователей проверяем в базе данных
    const result = await pool.query(
      'SELECT id, username, email, role, blocked FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      console.log(`[authenticateToken] Пользователь не найден в БД. ID: ${decoded.id}`);
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const user = result.rows[0];

    if (user.blocked) {
      console.log(`[authenticateToken] Пользователь заблокирован. ID: ${decoded.id}`);
      return res.status(403).json({ error: 'Аккаунт заблокирован' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('[authenticateToken] Ошибка проверки токена:', err.message);
    return res.status(403).json({ error: 'Недействительный токен' });
  }
};

module.exports = authenticateToken; 