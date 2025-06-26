import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { placesService } from '../services/api';

// Асинхронные thunk действия
export const fetchPlaces = createAsyncThunk(
  'places/fetchAll',
  async ({ category, search }, { rejectWithValue }) => {
    try {
      const response = await placesService.getAllPlaces({ category, search });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch places');
    }
  }
);

export const fetchPlaceById = createAsyncThunk(
  'places/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await placesService.getPlaceById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch place');
    }
  }
);

export const addNewPlace = createAsyncThunk(
  'places/addNew',
  async (placeData, { rejectWithValue }) => {
    try {
      const response = await placesService.addPlace(placeData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to add place');
    }
  }
);

// Начальное состояние
const initialState = {
  places: [],
  currentPlace: null,
  loading: false,
  error: null,
  categoryFilter: 'all',
  searchQuery: '',
};

const placesSlice = createSlice({
  name: 'places',
  initialState,
  reducers: {
    setCategoryFilter: (state, action) => {
      state.categoryFilter = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    clearPlacesError: (state) => {
      state.error = null;
    },
    clearCurrentPlace: (state) => {
      state.currentPlace = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Обработка fetchPlaces
      .addCase(fetchPlaces.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlaces.fulfilled, (state, action) => {
        state.places = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchPlaces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Обработка fetchPlaceById
      .addCase(fetchPlaceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlaceById.fulfilled, (state, action) => {
        state.currentPlace = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchPlaceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Обработка addNewPlace
      .addCase(addNewPlace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addNewPlace.fulfilled, (state, action) => {
        state.places.unshift(action.payload);
        state.loading = false;
        state.error = null;
      })
      .addCase(addNewPlace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export const {
  setCategoryFilter,
  setSearchQuery,
  clearPlacesError,
  clearCurrentPlace,
} = placesSlice.actions;

// Селекторы
export const selectAllPlaces = (state) => state.places.places;
export const selectCurrentPlace = (state) => state.places.currentPlace;
export const selectPlacesLoading = (state) => state.places.loading;
export const selectPlacesError = (state) => state.places.error;
export const selectCategoryFilter = (state) => state.places.categoryFilter;
export const selectSearchQuery = (state) => state.places.searchQuery;

export default placesSlice.reducer; 