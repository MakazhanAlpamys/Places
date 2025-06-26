import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectTranslation } from '../redux/languageSlice';
import { motion } from 'framer-motion';
import { FaStar, FaMapMarkerAlt, FaPhone, FaGlobe, FaClock, FaArrowLeft } from 'react-icons/fa';
import { 
  fetchPlaceById, 
  selectCurrentPlace,
  selectPlacesLoading,
  selectPlacesError,
  clearCurrentPlace
} from '../redux/placesSlice';

// Модифицированный массив данных с одним изображением для каждого места
export const placesData = [
  {
    id: 1,
    name: 'Central Park',
    description: 'A beautiful urban park in the heart of the city. Features include walking paths, a lake, and various recreational activities.',
    address: '123 Park Avenue, City Center',
    rating: 4.8,
    category: 'Parks',
    phone: '+1 (123) 456-7890',
    website: 'www.centralpark.com',
    hours: 'Open 24 hours',
    location: 'New York, USA',
    image: 'https://images.unsplash.com/photo-1534251369789-5067c8b8602a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 2,
    name: 'Louvre Museum',
    description: 'One of the world\'s largest art museums and a historic monument. A central landmark of Paris, it houses masterpieces including the Mona Lisa and Venus de Milo.',
    address: 'Rue de Rivoli, 75001',
    rating: 4.9,
    category: 'Museums',
    phone: '+33 1 40 20 50 50',
    website: 'www.louvre.fr',
    hours: '9:00 AM - 6:00 PM, Closed on Tuesdays',
    location: 'Paris, France',
    image: 'https://images.unsplash.com/photo-1597923739822-a0847a3a3768?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 3,
    name: 'Coffee House',
    description: 'A charming café serving artisanal coffee and homemade pastries. Perfect spot for working or meeting friends in a cozy atmosphere.',
    address: 'Kärntner Str. 42',
    rating: 4.5,
    category: 'Cafes',
    phone: '+43 1 5124763',
    website: 'www.viennacoffee.com',
    hours: '7:00 AM - 8:00 PM',
    location: 'Vienna, Austria',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 4,
    name: 'Grand Plaza Hotel',
    description: 'Luxury 5-star hotel offering exceptional service, elegant rooms, and state-of-the-art facilities. Features include a rooftop pool, spa, and fine dining restaurants.',
    address: 'Sheikh Zayed Road',
    rating: 4.7,
    category: 'Hotels',
    phone: '+971 4 123 4567',
    website: 'www.grandplazadubai.com',
    hours: 'Check-in: 2:00 PM, Check-out: 12:00 PM',
    location: 'Dubai, UAE',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 5,
    name: 'Mountain View',
    description: 'Breathtaking natural site offering panoramic views of the Alps. Popular for hiking in summer and skiing in winter, with well-maintained trails and facilities.',
    address: 'Alpine Route 25',
    rating: 4.9,
    category: 'Nature',
    phone: '+41 77 123 4567',
    website: 'www.swissalps-view.ch',
    hours: 'Accessible from 7:00 AM - 9:00 PM (seasonal variations)',
    location: 'Alps, Switzerland',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 6,
    name: 'City Mall',
    description: 'Premier shopping destination featuring over 300 retail outlets, from luxury brands to local favorites. Includes a food court, cinema complex, and children\'s play area.',
    address: '1 Orchard Boulevard',
    rating: 4.4,
    category: 'Shopping',
    phone: '+65 6123 4567',
    website: 'www.citymallsingapore.com',
    hours: '10:00 AM - 10:00 PM',
    location: 'Singapore',
    image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  }
];

function PlaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useSelector(selectTranslation);
  const place = useSelector(selectCurrentPlace);
  const loading = useSelector(selectPlacesLoading);
  const error = useSelector(selectPlacesError);
  
  useEffect(() => {
    // Загружаем данные о месте при монтировании компонента
    dispatch(fetchPlaceById(id));
    
    // Очищаем данные о месте при размонтировании компонента
    return () => {
      dispatch(clearCurrentPlace());
    };
  }, [dispatch, id]);
  
  if (loading && !place) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md w-full mb-4">
          <span className="block sm:inline">{error}</span>
        </div>
        <Link 
          to="/places" 
          className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
        >
          {t.backToPlaces || 'Back to places'}
        </Link>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">
          {t.placeNotFound || 'Place not found'}
        </h2>
        <Link 
          to="/places" 
          className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
        >
          {t.backToPlaces || 'Back to places'}
        </Link>
      </div>
    );
  }

  // Используем либо image из API, либо images[0], если структура данных старая
  const placeImage = place.image || (place.images && place.images[0]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6 flex justify-between items-start">
            <div>
              <div className="flex items-center">
                <button
                  onClick={() => navigate(-1)}
                  className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <FaArrowLeft className="text-xl" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{place.name}</h1>
                  <div className="flex items-center mt-2">
                    <FaStar className="text-yellow-500" />
                    <span className="ml-1 text-gray-800 dark:text-gray-200">{place.rating}</span>
                    <span className="mx-2 text-gray-400">•</span>
                    <span className="text-gray-600 dark:text-gray-400">{place.category}</span>
                    <span className="mx-2 text-gray-400">•</span>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <FaMapMarkerAlt className="mr-1" />
                      <span>{place.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
            <div className="lg:col-span-3">
              <div className="h-96 overflow-hidden rounded-lg mb-2">
                <img 
                  src={placeImage} 
                  alt={place.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Available';
                  }}
                />
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  {t.information || 'Information'}
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">{t.address || 'Address'}</h3>
                    <p className="text-gray-900 dark:text-white">{place.address}</p>
                  </div>
                  
                  {place.phone && (
                    <div>
                      <h3 className="font-medium text-gray-700 dark:text-gray-300">{t.phone || 'Phone'}</h3>
                      <div className="flex items-center">
                        <FaPhone className="text-green-600 dark:text-green-400 mr-2" />
                        <p className="text-gray-900 dark:text-white">{place.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {place.website && (
                    <div>
                      <h3 className="font-medium text-gray-700 dark:text-gray-300">{t.website || 'Website'}</h3>
                      <div className="flex items-center">
                        <FaGlobe className="text-blue-600 dark:text-blue-400 mr-2" />
                        <a 
                          href={`https://${place.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {place.website}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {place.hours && (
                    <div>
                      <h3 className="font-medium text-gray-700 dark:text-gray-300">{t.hours || 'Hours'}</h3>
                      <div className="flex items-center">
                        <FaClock className="text-green-600 dark:text-green-400 mr-2" />
                        <p className="text-gray-900 dark:text-white">{place.hours}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              {t.about || 'About'}
            </h2>
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line">
              {place.description}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default PlaceDetail; 