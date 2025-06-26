/**
 * Middleware проверки роли администратора
 * Гарантирует, что запрос исходит от пользователя с ролью admin
 */
const checkAdminRole = (req, res, next) => {
  console.log('[checkAdminRole] Проверка прав администратора');
  
  // Проверяем, что пользователь определен в запросе (после authenticateToken)
  if (!req.user) {
    console.error('[checkAdminRole] Пользователь не аутентифицирован');
    return res.status(401).json({ error: 'Пользователь не аутентифицирован' });
  }
  
  console.log(`[checkAdminRole] Проверка роли пользователя ID: ${req.user.id}, Роль: ${req.user.role}, URL: ${req.originalUrl}, Метод: ${req.method}`);
  
  // Проверяем роль пользователя
  if (req.user.role !== 'admin') {
    console.error(`[checkAdminRole] Отказано в доступе. Пользователь ID: ${req.user.id} имеет роль ${req.user.role}, требуется admin`);
    return res.status(403).json({ error: 'Доступ запрещён. Требуются права администратора.' });
  }
  
  // Проверка для хардкодированного админа (ID=999)
  if (req.user.id === 999) {
    console.log(`[checkAdminRole] Обнаружен хардкодированный администратор. ID: ${req.user.id}, URL: ${req.originalUrl}`);
  }
  
  console.log(`[checkAdminRole] Доступ предоставлен. Пользователь ID: ${req.user.id} имеет роль admin, URL: ${req.originalUrl}`);
  next();
};

module.exports = checkAdminRole; 