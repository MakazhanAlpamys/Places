import axios from 'axios';

// Базовый URL API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Создание экземпляра axios с базовым URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавление перехватчика запросов для добавления токена авторизации
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Подробное логирование всех запросов
    let logMessage = `[API] Запрос: ${config.method.toUpperCase()} ${config.url}`;
    if (config.data) {
      // Не логируем пароли и чувствительные данные
      const safeData = { ...config.data };
      if (safeData.password) safeData.password = '***';
      if (safeData.currentPassword) safeData.currentPassword = '***';
      if (safeData.newPassword) safeData.newPassword = '***';
      logMessage += `, данные: ${JSON.stringify(safeData)}`;
    }
    
    // Добавляем информацию о пользователе из localStorage для анализа
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        logMessage += `, userID: ${user.id}, роль: ${user.role}`;
      }
    } catch (error) {
      // Игнорируем ошибки парсинга
    }
    
    console.log(logMessage);
    return config;
  },
  (error) => {
    console.error('[API] Ошибка запроса:', error);
    return Promise.reject(error);
  }
);

// Перехват ответов для обработки ошибок авторизации
api.interceptors.response.use(
  (response) => {
    // Логирование успешных ответов
    console.log(`[API] Успех: ${response.status} от ${response.config.url}, данные: ${JSON.stringify(response.data)}`);
    return response;
  },
  (error) => {
    // Детальное логирование ошибок
    const status = error.response?.status;
    const method = error.config?.method?.toUpperCase();
    const url = error.config?.url;
    const errorData = error.response?.data;
    
    console.error(`[API] Ошибка: ${status}, ${method} ${url}, данные: ${JSON.stringify(errorData || {})}`);
    
    // Если код ответа 401 (неавторизован), очищаем данные авторизации
    if (error.response && error.response.status === 401) {
      console.log('[API] Получен статус 401, проверка пользователя');
      
      // Проверяем, не является ли это запросом на логин/регистрацию
      const url = error.config.url;
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        try {
          // Проверяем, является ли пользователь дефолтным
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            const user = JSON.parse(savedUser);
            if (user.email === 'admin@example.com' || user.email === 'user@example.com') {
              console.log('[API] Ошибка для дефолтного пользователя, НЕ выходим из системы');
              // Для дефолтных пользователей просто возвращаем ошибку, но не очищаем данные
              return Promise.reject(error);
            }
          }
          
          console.log('[API] Сессия обычного пользователя истекла, очистка локального хранилища');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Задержка для предотвращения циклических редиректов
          setTimeout(() => {
            console.log('[API] Перенаправление на страницу входа');
            window.location.href = '/login';
          }, 200);
        } catch (e) {
          console.error('[API] Ошибка при проверке пользователя:', e);
          // В случае ошибки при проверке, не очищаем данные во избежание потери данных
        }
      }
    }
    
    // Специальная обработка ошибок для админ-панели
    if (error.config?.url?.includes('/admin') && error.response?.status === 403) {
      console.error('[API] Ошибка доступа к админ-панели:', errorData?.error || 'Доступ запрещен');
    }
    
    return Promise.reject(error);
  }
);

// Сервисы для аутентификации
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  logout: () => api.post('/auth/logout', {}),
};

// Сервисы для работы с местами
export const placesService = {
  getAllPlaces: (params) => {
    console.log('[API] Вызов placesService.getAllPlaces()', params ? `с параметрами: ${JSON.stringify(params)}` : 'без параметров');
    return api.get('/places', { params });
  },
  getPlaceById: (id) => {
    console.log(`[API] Вызов placesService.getPlaceById(${id})`);
    return api.get(`/places/${id}`);
  },
  addPlace: (placeData) => {
    console.log('[API] Вызов placesService.addPlace() с данными:', { 
      ...placeData, 
      // Для отладки показываем только первый URL изображения
      images: Array.isArray(placeData.images) 
        ? [`${placeData.images[0].substring(0, 30)}... и еще ${placeData.images.length - 1}`] 
        : placeData.images 
    });
    
    // Проверяем наличие обязательных полей
    const requiredFields = ['name', 'description', 'address', 'location', 'category'];
    for (const field of requiredFields) {
      if (!placeData[field]) {
        console.error(`[API] Ошибка: отсутствует обязательное поле ${field}`);
        return Promise.reject({ response: { data: { error: `Missing required field: ${field}` } } });
      }
    }
    
    // Проверяем наличие хотя бы одного изображения
    if (!Array.isArray(placeData.images) || placeData.images.length === 0) {
      console.error('[API] Ошибка: нет изображений');
      return Promise.reject({ response: { data: { error: 'At least one image is required' } } });
    }
    
    return api.post('/places', placeData);
  },
  deletePlace: (id) => {
    console.log(`[API] Вызов placesService.deletePlace(${id})`);
    return api.delete(`/places/${id}`);
  },
  updatePlace: (id, placeData) => {
    console.log(`[API] Вызов placesService.updatePlace(${id}) с данными:`, placeData);
    return api.put(`/places/${id}`, placeData);
  },
};

// Сервисы для административной панели
export const adminService = {
  getAllUsers: () => {
    console.log('[API] Вызов adminService.getAllUsers()');
    return api.get('/admin/users');
  },
  blockUser: (userId, blocked) => {
    console.log(`[API] Вызов adminService.blockUser(${userId}, ${blocked})`);
    return api.put(`/admin/users/${userId}/block`, { blocked });
  },
  deleteUser: (userId) => {
    console.log(`[API] Вызов adminService.deleteUser(${userId})`);
    return api.delete(`/admin/users/${userId}`);
  },
  getStats: () => {
    console.log('[API] Вызов adminService.getStats()');
    return api.get('/admin/stats');
  },
  saveSettings: (settings) => {
    console.log('[API] Вызов adminService.saveSettings():', settings);
    // В реальной реализации здесь будет запрос к серверу для сохранения настроек
    // Пока мы просто симулируем успешный ответ
    return Promise.resolve({ data: settings });
  }
};

export default api; 