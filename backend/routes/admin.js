const express = require('express');
const router = express.Router();
const pool = require('../db');
const checkAdminRole = require('../middleware/checkAdminRole');
const authenticateToken = require('../middleware/authMiddleware');

// Применяем промежуточное ПО аутентификации и проверки роли админа для всех маршрутов
router.use(authenticateToken);
router.use(checkAdminRole);

// Добавляем логирование для всех запросов админ-панели
router.use((req, res, next) => {
  console.log(`[Admin API] ${req.method} ${req.path} - User ID: ${req.user.id}, Role: ${req.user.role}`);
  next();
});

// Получение всех пользователей
router.get('/users', async (req, res) => {
  try {
    console.log('[Admin API] Запрос на получение всех пользователей');
    const result = await pool.query(
      'SELECT id, username, email, role, created_at, blocked FROM users ORDER BY created_at DESC'
    );
    console.log(`[Admin API] Найдено ${result.rows.length} пользователей`);
    res.json(result.rows);
  } catch (error) {
    console.error('[Admin API] Ошибка при получении пользователей:', error);
    res.status(500).json({ error: 'Ошибка сервера при получении пользователей' });
  }
});

// Блокировка/разблокировка пользователя
router.put('/users/:id/block', async (req, res) => {
  const { id } = req.params;
  const { blocked } = req.body;
  
  console.log(`[Admin API] Запрос на ${blocked ? 'блокировку' : 'разблокировку'} пользователя ID: ${id}`);
  
  try {
    // Проверяем, является ли целевой пользователь админом
    const userCheck = await pool.query('SELECT role FROM users WHERE id = $1', [id]);
    
    if (userCheck.rows.length === 0) {
      console.log(`[Admin API] Пользователь ID: ${id} не найден`);
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    if (userCheck.rows[0].role === 'admin') {
      console.log(`[Admin API] Попытка ${blocked ? 'блокировки' : 'разблокировки'} администратора отклонена`);
      return res.status(403).json({ 
        error: `Невозможно ${blocked ? 'заблокировать' : 'разблокировать'} администратора` 
      });
    }
    
    const result = await pool.query(
      'UPDATE users SET blocked = $1 WHERE id = $2 RETURNING id, username, email, blocked',
      [blocked, id]
    );
    
    if (result.rows.length === 0) {
      console.log(`[Admin API] Пользователь ID: ${id} не найден при обновлении`);
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    console.log(`[Admin API] Пользователь ID: ${id} успешно ${blocked ? 'заблокирован' : 'разблокирован'}`);
    res.json({ 
      message: `Пользователь успешно ${blocked ? 'заблокирован' : 'разблокирован'}`,
      userId: id,
      blocked: blocked
    });
  } catch (error) {
    console.error(`[Admin API] Ошибка при ${blocked ? 'блокировке' : 'разблокировке'} пользователя:`, error);
    res.status(500).json({ error: `Ошибка сервера при ${blocked ? 'блокировке' : 'разблокировке'} пользователя` });
  }
});

// Удаление пользователя
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  
  console.log(`[Admin API] Запрос на удаление пользователя ID: ${id}`);
  
  try {
    // Проверяем, является ли целевой пользователь админом
    const userCheck = await pool.query('SELECT role FROM users WHERE id = $1', [id]);
    
    if (userCheck.rows.length === 0) {
      console.log(`[Admin API] Пользователь ID: ${id} не найден`);
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    if (userCheck.rows[0].role === 'admin') {
      console.log(`[Admin API] Попытка удаления администратора отклонена`);
      return res.status(403).json({ error: 'Невозможно удалить администратора' });
    }
    
    // Удаляем пользователя
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    
    console.log(`[Admin API] Пользователь ID: ${id} успешно удален`);
    res.json({ message: 'Пользователь успешно удален', userId: id });
  } catch (error) {
    console.error('[Admin API] Ошибка при удалении пользователя:', error);
    res.status(500).json({ error: 'Ошибка сервера при удалении пользователя' });
  }
});

// Получение статистики
router.get('/stats', async (req, res) => {
  console.log('[Admin API] Запрос статистики админ-панели');
  
  try {
    // Общее количество пользователей
    const usersCountResult = await pool.query('SELECT COUNT(*) FROM users');
    
    // Общее количество мест
    const placesCountResult = await pool.query('SELECT COUNT(*) FROM places');
    
    // Статистика по категориям мест
    const categoryStatsResult = await pool.query(
      'SELECT category, COUNT(*) FROM places GROUP BY category'
    );
    
    // Регистрации пользователей по месяцам
    const userRegStatsResult = await pool.query(
      `SELECT 
        date_trunc('month', created_at) AS month,
        COUNT(*) 
      FROM users 
      GROUP BY month 
      ORDER BY month`
    );
    
    // Формируем объект со статистикой
    const stats = {
      totalUsers: parseInt(usersCountResult.rows[0].count),
      totalPlaces: parseInt(placesCountResult.rows[0].count),
      categoryStats: categoryStatsResult.rows.map(row => ({
        category: row.category,
        count: parseInt(row.count)
      })),
      userRegistrationStats: userRegStatsResult.rows.map(row => ({
        month: row.month,
        count: parseInt(row.count)
      }))
    };
    
    console.log('[Admin API] Статистика успешно получена:', stats);
    res.json(stats);
  } catch (error) {
    console.error('[Admin API] Ошибка при получении статистики:', error);
    res.status(500).json({ error: 'Ошибка сервера при получении статистики' });
  }
});

module.exports = router; 