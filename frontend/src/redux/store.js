import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import themeReducer from './themeSlice';
import languageReducer from './languageSlice';
import placesReducer from './placesSlice';
import adminReducer from './adminSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    language: languageReducer,
    places: placesReducer,
    admin: adminReducer,
  },
});

export default store; 