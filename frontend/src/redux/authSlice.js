import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../services/api';

// Асинхронный thunk для логина пользователя
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      localStorage.setItem('token', response.data.token);
      
      // Сохраняем данные пользователя в localStorage для сохранения сессии
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Для дефолтных пользователей добавляем временную метку
      if (credentials.email === 'admin@example.com' || credentials.email === 'user@example.com') {
        localStorage.setItem('tokenTimestamp', new Date().getTime().toString());
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Ошибка авторизации' });
    }
  }
);

// Асинхронный thunk для регистрации пользователя
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      localStorage.setItem('token', response.data.token);
      
      // Сохраняем данные пользователя в localStorage для сохранения сессии
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Ошибка регистрации' });
    }
  }
);

// Асинхронный thunk для получения текущего пользователя
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser();
      
      // Сохраняем обновленные данные пользователя
      localStorage.setItem('user', JSON.stringify(response.data));
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Ошибка получения данных пользователя' });
    }
  }
);

// Асинхронный thunk для обновления профиля пользователя
export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.updateProfile(userData);
      
      // Обновляем данные пользователя в localStorage
      localStorage.setItem('user', JSON.stringify(response.data));
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Ошибка обновления профиля' });
    }
  }
);

// Асинхронный thunk для изменения пароля
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      console.log('Отправка запроса на изменение пароля');
      const response = await authService.changePassword(passwordData);
      console.log('Ответ на запрос изменения пароля:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка изменения пароля:', error.response?.data);
      return rejectWithValue(error.response?.data || { message: 'Ошибка изменения пароля' });
    }
  }
);

// Асинхронный thunk для выхода пользователя
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { dispatch }) => {
    // Важно: тут нет try-catch, чтобы гарантировать выполнение очистки,
    // даже если возникнут ошибки в других частях кода
    
    console.log('AuthSlice: начинаем процесс выхода пользователя');
    
    // Удаляем все данные авторизации из localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenTimestamp');
    
    // Вызываем экшен для очистки состояния
    dispatch(clearAuth());
    
    console.log('AuthSlice: процесс выхода пользователя завершен');
    
    return { success: true };
  }
);

// Начальное состояние
const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isAdmin: JSON.parse(localStorage.getItem('user'))?.role === 'admin' || false,
  loading: false,
  error: null,
  successMessage: null
};

// Создание slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.successMessage = null;
    },
    clearAuth: (state) => {
      console.log('AuthSlice: очистка состояния авторизации');
      state.user = null;
      state.isAuthenticated = false;
      state.isAdmin = false;
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Обработка loginUser
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.isAdmin = action.payload.user.role === 'admin';
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Ошибка авторизации';
      })
      
      // Обработка registerUser
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.isAdmin = action.payload.user.role === 'admin';
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Ошибка регистрации';
      })
      
      // Обработка getCurrentUser
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.isAdmin = action.payload.role === 'admin';
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.isAdmin = false;
        state.error = action.payload?.message || 'Ошибка получения данных пользователя';
      })
      
      // Обработка updateUserProfile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
        state.successMessage = 'Профиль успешно обновлен';
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Ошибка обновления профиля';
        state.successMessage = null;
      })
      
      // Обработка changePassword
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.successMessage = 'Пароль успешно изменен';
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Ошибка изменения пароля';
        state.successMessage = null;
      })
      
      // Обработка logoutUser
      .addCase(logoutUser.pending, (state) => {
        console.log('AuthSlice: начало процесса выхода (pending)');
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        console.log('AuthSlice: выход выполнен успешно (fulfilled)');
        state.user = null;
        state.isAuthenticated = false;
        state.isAdmin = false;
        state.loading = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        console.log('AuthSlice: ошибка при выходе (rejected)');
        state.loading = false;
        // Даже при ошибке сбрасываем состояние авторизации для безопасности
        state.user = null;
        state.isAuthenticated = false;
        state.isAdmin = false;
        state.error = null;
      });
  }
});

// Экспорт действий
export const { clearError, clearSuccess, clearAuth } = authSlice.actions;

// Селекторы
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAdmin = (state) => state.auth.isAdmin;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthSuccess = (state) => state.auth.successMessage;

// Экспорт редюсера
export default authSlice.reducer; 