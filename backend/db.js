const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Настройки подключения к базе данных
const config = {
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'travelapp',
  // Дополнительные настройки для увеличения стабильности
  max: 20, // максимальное количество клиентов в пуле
  idleTimeoutMillis: 30000, // время простоя перед закрытием клиента
  connectionTimeoutMillis: 10000, // время ожидания соединения
};

console.log(`[DB] Establishing connection to PostgreSQL at ${config.host}:${config.port}/${config.database}`);

const pool = new Pool(config);

// Обработчик события ошибки для пула соединений
pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client', err);
  process.exit(-1);
});

// Проверка соединения при запуске сервера
(async () => {
  let client;
  try {
    // Получаем клиента из пула для проверки соединения
    client = await pool.connect();
    console.log('[DB] Database connection successful');
    
    // Проверяем наличие основных таблиц
    const tables = ['users', 'places', 'place_images', 'reviews', 'favorites'];
    for (const table of tables) {
      try {
        const res = await client.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`[DB] Table '${table}' exists with ${res.rows[0].count} records`);
      } catch (tableErr) {
        console.error(`[DB] Error checking table '${table}':`, tableErr.message);
      }
    }
  } catch (err) {
    console.error('[DB] Database connection error:', err.message);
    console.error('[DB] Please check your database configuration and ensure PostgreSQL is running');
  } finally {
    // Возвращаем клиента в пул
    if (client) client.release();
  }
})();

// Обертка для запросов к базе данных с логированием
const originalQuery = pool.query;
pool.query = (...args) => {
  const [query, params] = args;
  const start = Date.now();
  
  const queryText = typeof query === 'string' ? query : query.text;
  const sanitizedQuery = queryText.replace(/\s+/g, ' ').trim();
  
  // Выводим запрос (для отладки)
  if (sanitizedQuery.startsWith('SELECT')) {
    console.log(`[DB] Query: ${sanitizedQuery.substring(0, 80)}${sanitizedQuery.length > 80 ? '...' : ''}`);
  } else {
    console.log(`[DB] Query: ${sanitizedQuery}`);
  }
  
  return originalQuery.apply(pool, args)
    .then(res => {
      const duration = Date.now() - start;
      console.log(`[DB] Query executed in ${duration}ms, rows: ${res.rowCount}`);
      return res;
    })
    .catch(err => {
      const duration = Date.now() - start;
      console.error(`[DB] Query error after ${duration}ms:`, err.message);
      console.error(`[DB] Failed query: ${sanitizedQuery}`);
      if (params) console.error(`[DB] Parameters:`, params);
      throw err;
    });
};

module.exports = pool; 