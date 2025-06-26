import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaStar, FaSearch } from 'react-icons/fa';
import { 
  fetchPlaces, 
  selectAllPlaces,
  selectPlacesLoading,
  selectPlacesError,
  setCategoryFilter,
  setSearchQuery,
  selectCategoryFilter,
  selectSearchQuery
} from '../redux/placesSlice';
import { selectTranslation } from '../redux/languageSlice';

// Компонент для отображения карточки места
const PlaceCard = ({ place }) => {
  const t = useSelector(selectTranslation);
  
  return (
    <Link to={`/places/${place.id}`}>
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden h-full flex flex-col"
      >
        <div className="h-48 overflow-hidden">
          <img 
            src={place.image || (place.images && place.images[0])} 
            alt={place.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
            }}
          />
        </div>
        <div className="p-4 flex-grow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{place.name}</h3>
          <div className="flex items-center mt-1">
            <FaStar className="text-yellow-500" />
            <span className="ml-1 text-gray-700 dark:text-gray-300">{place.rating}</span>
            <span className="mx-2 text-gray-400">•</span>
            <span className="text-gray-600 dark:text-gray-400">{place.category}</span>
          </div>
          <div className="flex items-center mt-2 text-gray-600 dark:text-gray-400">
            <FaMapMarkerAlt className="mr-1" />
            <span>{place.location}</span>
          </div>
          <p className="mt-2 text-gray-600 dark:text-gray-400 line-clamp-2">{place.description}</p>
        </div>
      </motion.div>
    </Link>
  );
};

function PlacesList() {
  const t = useSelector(selectTranslation);
  const dispatch = useDispatch();
  const places = useSelector(selectAllPlaces);
  const loading = useSelector(selectPlacesLoading);
  const error = useSelector(selectPlacesError);
  const categoryFilter = useSelector(selectCategoryFilter);
  const searchQuery = useSelector(selectSearchQuery);
  
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Загрузка данных при монтировании компонента
  useEffect(() => {
    dispatch(fetchPlaces({}));
  }, [dispatch]);
  
  // Фильтрация мест по категории и поисковому запросу
  const filteredPlaces = places.filter(place => {
    const matchesCategory = categoryFilter === 'all' || place.category === categoryFilter;
    const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          place.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          place.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  const handleCategoryChange = (category) => {
    dispatch(setCategoryFilter(category));
  };
  
  const handleSearch = (e) => {
    dispatch(setSearchQuery(e.target.value));
  };
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t.discoverPlaces || 'Discover Amazing Places'}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {t.discoverBestLocations || 'Discover the best locations around you'}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center mb-8 gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 text-gray-900 dark:text-white focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder={t.searchPlaces || 'Search places...'}
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                categoryFilter === 'all' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
              }`}
            >
              {t.allPlaces || 'All Places'}
            </button>
            <button
              onClick={() => handleCategoryChange('Parks')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                categoryFilter === 'Parks' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
              }`}
            >
              {t.parks || 'Parks'}
            </button>
            <button
              onClick={() => handleCategoryChange('Museums')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                categoryFilter === 'Museums' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
              }`}
            >
              {t.museums || 'Museums'}
            </button>
            <button
              onClick={() => handleCategoryChange('Cafes')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                categoryFilter === 'Cafes' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
              }`}
            >
              {t.cafes || 'Cafes'}
            </button>
            <button
              onClick={() => handleCategoryChange('Hotels')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                categoryFilter === 'Hotels' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
              }`}
            >
              {t.hotels || 'Hotels'}
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <span className="block sm:inline">{error}</span>
          </div>
        ) : filteredPlaces.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              {t.noPlacesFound || 'No places found'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t.tryDifferentSearch || 'Try a different search query or category'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlaces.map((place) => (
              <PlaceCard 
                key={place.id} 
                place={place}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PlacesList; 