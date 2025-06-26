import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  fetchPlaces, 
  selectAllPlaces,
  selectPlacesLoading,
  setCategoryFilter
} from '../redux/placesSlice';
import { selectTranslation } from '../redux/languageSlice';
import { FaStar, FaMapMarkerAlt } from 'react-icons/fa';

function Home() {
  const t = useSelector(selectTranslation);
  const dispatch = useDispatch();
  const places = useSelector(selectAllPlaces);
  const loading = useSelector(selectPlacesLoading);
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Загрузка данных при монтировании компонента
  useEffect(() => {
    dispatch(fetchPlaces({}));
  }, [dispatch]);
  
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    dispatch(setCategoryFilter(category));
  };
  
  // Фильтрация мест по категории
  const filteredPlaces = places.filter(place => {
    return selectedCategory === 'all' || place.category === selectedCategory;
  });
  
  // Сортировка мест по рейтингу
  const sortedPlaces = [...filteredPlaces].sort((a, b) => {
    return b.rating - a.rating;
  });
  
  // Показываем только 6 мест на главной странице
  const topPlaces = sortedPlaces.slice(0, 6);
  
  // Категории
  const categories = [
    { id: 'all', name: t.allPlaces || 'All Places' },
    { id: 'Parks', name: t.parks || 'Parks' },
    { id: 'Museums', name: t.museums || 'Museums' },
    { id: 'Cafes', name: t.cafes || 'Cafes' },
    { id: 'Hotels', name: t.hotels || 'Hotels' }
  ];
  
  return (
    <div className="bg-gray-100 dark:bg-gray-900">
      {/* Главный баннер */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-blue-600 opacity-90"></div>
        <div className="relative h-96 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
              {t.discoverAmazingPlaces || 'Discover Amazing Places'}
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-white">
              {t.findPerfectPlace || 'Find the perfect place for your next adventure'}
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                to="/places"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-green-700 bg-white hover:bg-gray-50 shadow-lg"
              >
                {t.exploreAll || 'Explore All Places'}
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Популярные места */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t.popularPlaces || 'Popular Places'}
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t.discoverBestLocations || 'Discover the best locations around you'}
          </p>
        </div>
        
        {/* Фильтры категорий */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                selectedCategory === category.id 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : topPlaces.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              {t.noPlacesFound || 'No places found'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t.tryDifferentSearch || 'Try a different category'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topPlaces.map(place => (
              <Link key={place.id} to={`/places/${place.id}`}>
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
            ))}
          </div>
        )}
        
        <div className="text-center mt-10">
          <Link
            to="/places"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            {t.viewAllPlaces || 'View All Places'}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home; 