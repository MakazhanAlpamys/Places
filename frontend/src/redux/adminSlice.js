import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminService, placesService } from '../services/api';

// Асинхронные thunk действия
export const fetchAllUsers = createAsyncThunk(
  'admin/fetchAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Admin: Отправка запроса на получение всех пользователей');
      const response = await adminService.getAllUsers();
      console.log('Admin: Получен ответ от сервера с пользователями:', response.data);
      return response.data;
    } catch (error) {
      console.error('Admin: Ошибка при получении пользователей:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch users');
    }
  }
);

// Получение списка всех мест для админ-панели
export const fetchAllPlaces = createAsyncThunk(
  'admin/fetchAllPlaces',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Admin: Отправка запроса на получение всех мест');
      const response = await placesService.getAllPlaces();
      console.log('Admin: Получен ответ от сервера с местами:', response.data);
      
      // Проверяем, что полученные данные - это массив
      if (!Array.isArray(response.data)) {
        console.error('Admin: Полученные данные не являются массивом:', response.data);
        return rejectWithValue('Некорректный формат данных при получении мест');
      }
      
      // Убедимся, что у всех мест есть ID
      const validPlaces = response.data.filter(place => place.id);
      
      if (validPlaces.length === 0 && response.data.length > 0) {
        console.error('Admin: Все полученные места не имеют ID');
        return rejectWithValue('Полученные места не содержат ID');
      }
      
      console.log(`Admin: Успешно получено ${validPlaces.length} мест`);
      return validPlaces;
    } catch (error) {
      console.error('Admin: Ошибка при получении мест:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch places');
    }
  }
);

// Добавление нового места
export const addPlace = createAsyncThunk(
  'admin/addPlace',
  async (placeData, { rejectWithValue }) => {
    try {
      console.log('Admin: Отправка запроса на добавление нового места:', placeData.name);
      
      // Проверяем наличие обязательных полей
      if (!placeData.name || !placeData.description || !placeData.location || !placeData.category) {
        console.error('Admin: Отсутствуют обязательные поля для места');
        return rejectWithValue('Отсутствуют обязательные поля');
      }
      
      // Проверяем наличие хотя бы одного изображения
      if (!Array.isArray(placeData.images) || placeData.images.length === 0) {
        console.error('Admin: Не указаны изображения для места');
        return rejectWithValue('Требуется хотя бы одно изображение');
      }
      
      // Выполняем запрос к API
      console.log('Admin: Данные для отправки:', { ...placeData, images: placeData.images });
      const response = await placesService.addPlace(placeData);
      console.log('Admin: Место успешно добавлено:', response.data);
      
      // Убедимся, что ответ содержит правильный формат данных
      if (!response.data || !response.data.id) {
        console.error('Admin: Некорректный ответ при добавлении места:', response.data);
        return rejectWithValue('Некорректный ответ от сервера');
      }
      
      return response.data;
    } catch (error) {
      console.error('Admin: Ошибка при добавлении места:', error.response?.data || error.message);
      // Возвращаем ошибку с сервера или общую ошибку, если ответа нет
      return rejectWithValue(
        error.response?.data?.error || 
        error.message || 
        'Ошибка при добавлении места'
      );
    }
  }
);

// Удаление места
export const deletePlace = createAsyncThunk(
  'admin/deletePlace',
  async (placeId, { rejectWithValue }) => {
    try {
      console.log('Admin: Отправка запроса на удаление места:', placeId);
      const response = await placesService.deletePlace(placeId);
      console.log('Admin: Место успешно удалено:', response.data);
      return placeId;
    } catch (error) {
      console.error('Admin: Ошибка при удалении места:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.error || 'Failed to delete place');
    }
  }
);

export const blockUser = createAsyncThunk(
  'admin/blockUser',
  async ({ userId, blocked }, { rejectWithValue }) => {
    try {
      console.log(`Admin: Запрос на ${blocked ? 'блокировку' : 'разблокировку'} пользователя ${userId}`);
      const response = await adminService.blockUser(userId, blocked);
      console.log('Admin: Ответ сервера на блокировку/разблокировку:', response.data);
      
      // Возвращаем составной объект с данными ответа и userId для обновления состояния
      return { ...response.data, userId, blocked };
    } catch (error) {
      console.error('Admin: Ошибка при блокировке/разблокировке пользователя:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { message: 'Ошибка при блокировке/разблокировке пользователя' });
    }
  }
);

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      console.log('Admin: Отправка запроса на удаление пользователя:', userId);
      const response = await adminService.deleteUser(userId);
      console.log('Admin: Ответ сервера на удаление пользователя:', response.data);
      return userId;
    } catch (error) {
      console.error('Admin: Ошибка при удалении пользователя:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.error || 'Failed to delete user');
    }
  }
);

export const fetchAdminStats = createAsyncThunk(
  'admin/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Admin: Отправка запроса на получение статистики');
      const response = await adminService.getStats();
      console.log('Admin: Получена статистика от сервера:', response.data);
      return response.data;
    } catch (error) {
      console.error('Admin: Ошибка при получении статистики:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch statistics');
    }
  }
);

export const saveAppSettings = createAsyncThunk(
  'admin/saveSettings',
  async (settings, { rejectWithValue }) => {
    try {
      console.log('Admin: Отправка запроса на сохранение настроек приложения');
      // В реальном приложении здесь был бы вызов API для сохранения настроек
      // const response = await adminService.saveSettings(settings);
      
      // Пока что только симулируем успешный ответ
      console.log('Admin: Настройки успешно сохранены:', settings);
      return settings;
    } catch (error) {
      console.error('Admin: Ошибка при сохранении настроек:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.error || 'Failed to save settings');
    }
  }
);

// Начальное состояние
const initialState = {
  users: [],
  places: [],
  stats: null,
  settings: {
    siteName: 'TravelApp',
    siteDescription: 'Find the best places around you',
    enableRegistration: true
  },
  loading: false,
  error: null,
  success: null
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
    clearAdminSuccess: (state) => {
      state.success = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Обработка fetchAllUsers
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.users = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Произошла ошибка при загрузке пользователей';
      })
      
      // Обработка fetchAllPlaces
      .addCase(fetchAllPlaces.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPlaces.fulfilled, (state, action) => {
        state.places = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchAllPlaces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Произошла ошибка при загрузке мест';
      })
      
      // Обработка addPlace
      .addCase(addPlace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPlace.fulfilled, (state, action) => {
        state.places.push(action.payload);
        state.loading = false;
        state.success = 'Место успешно добавлено';
      })
      .addCase(addPlace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Произошла ошибка при добавлении места';
      })
      
      // Обработка deletePlace
      .addCase(deletePlace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePlace.fulfilled, (state, action) => {
        state.places = state.places.filter(place => place.id !== action.payload);
        state.loading = false;
        state.success = 'Место успешно удалено';
      })
      .addCase(deletePlace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Произошла ошибка при удалении места';
      })
      
      // Обработка blockUser
      .addCase(blockUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(blockUser.fulfilled, (state, action) => {
        state.loading = false;
        // Обновляем информацию о пользователе в списке
        state.users = state.users.map(user => 
          user.id === action.payload.userId 
            ? { ...user, blocked: action.payload.blocked } 
            : user
        );
        state.success = action.payload.blocked 
          ? 'Пользователь успешно заблокирован' 
          : 'Пользователь успешно разблокирован';
      })
      .addCase(blockUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Ошибка при блокировке/разблокировке пользователя';
      })
      
      // Обработка deleteUser
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(user => user.id !== action.payload);
        state.loading = false;
        state.success = 'Пользователь успешно удален';
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Произошла ошибка при удалении пользователя';
      })
      
      // Обработка fetchAdminStats
      .addCase(fetchAdminStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.stats = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Произошла ошибка при загрузке статистики';
      })
      
      // Обработка saveAppSettings
      .addCase(saveAppSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(saveAppSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
        state.loading = false;
        state.success = 'Настройки приложения успешно сохранены';
      })
      .addCase(saveAppSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Произошла ошибка при сохранении настроек';
      });
  },
});

export const { clearAdminError, clearAdminSuccess } = adminSlice.actions;

// Селекторы
export const selectAllUsers = (state) => state.admin.users;
export const selectAllPlaces = (state) => state.admin.places;
export const selectAdminStats = (state) => state.admin.stats;
export const selectAdminSettings = (state) => state.admin.settings;
export const selectAdminLoading = (state) => state.admin.loading;
export const selectAdminError = (state) => state.admin.error;
export const selectAdminSuccess = (state) => state.admin.success;

export default adminSlice.reducer; 