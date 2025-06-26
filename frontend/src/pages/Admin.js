import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectTranslation } from '../redux/languageSlice';
import { motion } from 'framer-motion';
import {
  fetchAllUsers,
  fetchAllPlaces,
  fetchAdminStats,
  blockUser,
  deleteUser,
  deletePlace,
  saveAppSettings,
  selectAllUsers,
  selectAllPlaces,
  selectAdminStats,
  selectAdminLoading,
  selectAdminError,
  selectAdminSuccess,
  clearAdminError,
  clearAdminSuccess
} from '../redux/adminSlice';
import { selectIsAdmin, logoutUser } from '../redux/authSlice';

function Admin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useSelector(selectTranslation);
  const isAdmin = useSelector(selectIsAdmin);
  const users = useSelector(selectAllUsers);
  const places = useSelector(selectAllPlaces);
  const stats = useSelector(selectAdminStats);
  const loading = useSelector(selectAdminLoading);
  const error = useSelector(selectAdminError);

  // Состояние для настроек приложения
  const [settings, setSettings] = useState({
    siteName: 'TravelApp',
    siteDescription: 'Find the best places around you',
    enableRegistration: true
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [confirmAction, setConfirmAction] = useState(null);

  // Проверяем права доступа при загрузке страницы
  useEffect(() => {
    console.log('Admin: Проверка прав доступа, isAdmin =', isAdmin);
    
    // Если пользователь не админ, перенаправляем на домашнюю страницу
    if (isAdmin === false) {
      console.log('Admin: Нет прав доступа, перенаправление на главную');
      navigate('/', { replace: true });
    } else if (isAdmin === true) {
      // Загружаем пользователей и статистику только если пользователь имеет права админа
      console.log('Admin: Есть права администратора, загрузка данных');
      dispatch(fetchAllUsers());
      dispatch(fetchAllPlaces());
      dispatch(fetchAdminStats());
      
      // Установим активную вкладку на основе query параметра, если он есть
      const queryParams = new URLSearchParams(window.location.search);
      const tab = queryParams.get('tab');
      if (tab && ['dashboard', 'places', 'users', 'settings'].includes(tab)) {
        setActiveTab(tab);
      }
    }
    
    // Очищаем состояние при размонтировании компонента
    return () => {
      dispatch(clearAdminError());
      dispatch(clearAdminSuccess());
    };
  }, [isAdmin, navigate, dispatch]);

  const handleApprovePlace = (placeId) => {
    console.log('Одобрение места:', placeId);
    // Реализация одобрения места или удаление если не используется
  };

  const handleDeletePlace = (placeId) => {
    console.log('Запрос на удаление места:', placeId);
    setConfirmAction({
      type: 'deletePlace',
      placeId,
      confirm: () => {
        console.log('Подтверждено удаление места:', placeId);
        dispatch(deletePlace(placeId))
          .unwrap()
          .then(() => {
            console.log('Место успешно удалено:', placeId);
          })
          .catch((error) => {
            console.error('Ошибка при удалении места:', error);
          });
        setConfirmAction(null);
      },
      cancel: () => setConfirmAction(null)
    });
  };

  const handleDeleteUser = (userId) => {
    console.log('Запрос на удаление пользователя:', userId);
    setConfirmAction({
      type: 'delete',
      userId,
      confirm: () => {
        console.log('Подтверждено удаление пользователя:', userId);
        dispatch(deleteUser(userId))
          .then((resultAction) => {
            if (deleteUser.fulfilled.match(resultAction)) {
              console.log('Пользователь успешно удален:', userId);
            } else {
              console.error('Ошибка при удалении пользователя:', resultAction.error);
            }
          });
        setConfirmAction(null);
      },
      cancel: () => setConfirmAction(null)
    });
  };

  const handleBlockUser = (userId, currentBlocked) => {
    const actionType = currentBlocked ? 'unblock' : 'block';
    console.log(`Запрос на ${actionType} пользователя:`, userId, 'текущий статус:', currentBlocked);
    
    setConfirmAction({
      type: actionType,
      userId,
      confirm: () => {
        console.log(`Подтверждено ${actionType} пользователя:`, userId);
        dispatch(blockUser({ userId, blocked: !currentBlocked }))
          .then((resultAction) => {
            if (blockUser.fulfilled.match(resultAction)) {
              console.log(`Пользователь успешно ${currentBlocked ? 'разблокирован' : 'заблокирован'}:`, userId);
            } else {
              console.error(`Ошибка при ${actionType} пользователя:`, resultAction.error);
            }
          });
        setConfirmAction(null);
      },
      cancel: () => setConfirmAction(null)
    });
  };

  // Обработчик выхода из системы
  const handleLogout = () => {
    console.log('Admin: Начало процесса выхода из системы администратора...');
    
    try {
      // Временно отключаем кнопки для предотвращения повторных нажатий
      const logoutButton = document.querySelector('[data-admin-logout-button]');
      if (logoutButton) {
        logoutButton.disabled = true;
      }
      
      // Запускаем процесс выхода
      dispatch(logoutUser())
        .then(() => {
          console.log('Admin: Выход выполнен успешно');
          
          // Для надежности делаем прямую очистку localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Небольшая задержка перед перенаправлением
          setTimeout(() => {
            console.log('Admin: Перенаправление на /login');
            navigate('/login', { replace: true });
            
            // Для надежности также принудительно обновляем страницу
            window.location.reload();
          }, 200);
        })
        .catch(error => {
          console.error('Admin: Ошибка при выходе администратора:', error);
          
          // Экстренное решение в случае ошибки
          localStorage.clear();
          window.location.href = '/login';
        });
    } catch (error) {
      console.error('Admin: Критическая ошибка при выходе из системы:', error);
      
      // Экстренное решение в случае ошибки
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  // Функция для сохранения настроек
  const handleSaveSettings = () => {
    console.log('Сохранение настроек:', settings);
    dispatch(saveAppSettings(settings))
      .unwrap()
      .then(() => {
        alert(t.settingsSaved || 'Settings saved successfully');
      })
      .catch(error => {
        console.error('Ошибка при сохранении настроек:', error);
        alert(t.settingsError || 'Error saving settings');
      });
  };

  // Функция для перехода на детальную статистику
  const handleViewCategoryDetails = () => {
    console.log('Переход к детальной статистике категорий');
    // Здесь можно добавить модальное окно или перейти на отдельную страницу
    setActiveTab('dashboard');
    // Прокрутка к секции статистики категорий
    document.getElementById('categories-stats-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading && !users.length) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 shadow rounded-lg"
        >
          <div className="bg-white dark:bg-gray-800 px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              {t.adminPanel || 'Панель администрирования'}
            </h3>
            
            <button
              data-admin-logout-button="true"
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-300 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm1 2v10h10V5H4z" clipRule="evenodd" />
              </svg>
              {t.logout || 'Выйти'}
            </button>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t.admin || 'Admin Panel'}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t.adminWelcome || 'Welcome to the admin panel. Manage places, users, and more.'}
            </p>
          </div>
          
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              <button
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'dashboard'
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('dashboard')}
              >
                {t.dashboard || 'Dashboard'}
              </button>
              <button
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'places'
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('places')}
              >
                {t.places}
              </button>
              <button
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('users')}
              >
                {t.users || 'Users'}
              </button>
              <button
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('settings')}
              >
                {t.settings || 'Settings'}
              </button>
            </nav>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            {activeTab === 'dashboard' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
              >
                <div className="bg-green-100 dark:bg-green-900/30 overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                        <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                            {t.totalUsers || 'Total Users'}
                          </dt>
                          <dd>
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                              {loading ? (
                                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                              ) : (
                                stats?.totalUsers || 0
                              )}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-800/20 px-5 py-3">
                    <div className="text-sm">
                      <button 
                        onClick={() => setActiveTab('users')}
                        className="font-medium text-green-700 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                      >
                        {t.viewAll || 'View all'}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-100 dark:bg-blue-900/30 overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                        <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                            {t.totalPlaces || 'Total Places'}
                          </dt>
                          <dd>
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                              {loading ? (
                                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                              ) : (
                                stats?.totalPlaces || 0
                              )}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-800/20 px-5 py-3">
                    <div className="text-sm">
                      <button 
                        onClick={() => setActiveTab('places')}
                        className="font-medium text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                      >
                        {t.viewAll || 'View all'}
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* График категорий */}
                <div className="bg-indigo-100 dark:bg-indigo-900/30 overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                        <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                            {t.categoriesStats || 'Categories Stats'}
                          </dt>
                          <dd>
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                              {loading ? (
                                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                              ) : (
                                stats?.categoryStats?.length || 0
                              )}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-800/20 px-5 py-3">
                    <div className="text-sm">
                      <button 
                        onClick={handleViewCategoryDetails}
                        className="font-medium text-indigo-700 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                      >
                        {t.details || 'View details'}
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Статистика по категориям мест */}
                <div id="categories-stats-section" className="col-span-1 sm:col-span-2 lg:col-span-3 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                    {t.categoriesDistribution || 'Categories Distribution'}
                  </h3>
                  {loading ? (
                    <div className="h-52 w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                  ) : stats?.categoryStats?.length > 0 ? (
                    <div className="h-52 overflow-hidden">
                      <div className="flex h-full">
                        {stats.categoryStats.map((category, index) => (
                          <div 
                            key={category.category} 
                            className="flex flex-col justify-end h-full flex-1"
                          >
                            <div className="text-center mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                              {category.count}
                            </div>
                            <div 
                              style={{ height: `${(category.count / Math.max(...stats.categoryStats.map(c => c.count))) * 100}%` }}
                              className={`mx-2 rounded-t-md bg-gradient-to-t ${
                                index % 4 === 0 ? 'from-green-500 to-green-400' : 
                                index % 4 === 1 ? 'from-blue-500 to-blue-400' :
                                index % 4 === 2 ? 'from-purple-500 to-purple-400' :
                                'from-yellow-500 to-yellow-400'
                              }`}
                            ></div>
                            <div className="text-center mt-2 text-xs font-medium text-gray-500 dark:text-gray-400 truncate px-1">
                              {category.category}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400">
                        {t.noData || 'No category data available'}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Статистика регистраций пользователей */}
                <div className="col-span-1 sm:col-span-2 lg:col-span-3 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                    {t.userRegistrationStats || 'User Registration Statistics'}
                  </h3>
                  {loading ? (
                    <div className="h-52 w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                  ) : stats?.userRegistrationStats?.length > 0 ? (
                    <div className="h-52 overflow-hidden">
                      <div className="flex h-full">
                        {stats.userRegistrationStats.map((stat, index) => {
                          const date = new Date(stat.month);
                          const monthName = date.toLocaleString('default', { month: 'short' });
                          return (
                            <div 
                              key={`${monthName}-${index}`}
                              className="flex flex-col justify-end h-full flex-1"
                            >
                              <div className="text-center mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                                {stat.count}
                              </div>
                              <div 
                                style={{ height: `${(stat.count / Math.max(...stats.userRegistrationStats.map(s => s.count))) * 100}%` }}
                                className="mx-2 rounded-t-md bg-gradient-to-t from-green-500 to-green-400"
                              ></div>
                              <div className="text-center mt-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                                {monthName}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400">
                        {t.noData || 'No registration data available'}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
            
            {activeTab === 'places' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                    {t.managePlaces || 'Manage Places'}
                  </h2>
                  <button
                    onClick={() => navigate('/places/add')}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-300"
                  >
                    {t.addNewPlace || 'Add New Place'}
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  {loading && !places.length ? (
                    <div className="flex justify-center items-center py-6">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
                    </div>
                  ) : places.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-gray-500 dark:text-gray-400">
                        {t.noPlacesYet || 'No places yet. Add your first place!'}
                      </p>
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t.name || 'Name'}
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t.category || 'Category'}
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t.rating || 'Rating'}
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t.actions || 'Actions'}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                        {Array.isArray(places) && places.map((place) => (
                          <tr key={place.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {place.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {place.category}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {place.rating || '0'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              <button
                                onClick={() => navigate(`/places/${place.id}`)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                {t.view || 'View'}
                              </button>
                              <button
                                onClick={() => handleDeletePlace(place.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              >
                                {t.delete || 'Delete'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </motion.div>
            )}
            
            {activeTab === 'users' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t.username || 'Username'}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t.email || 'Email'}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t.role || 'Role'}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t.status || 'Status'}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t.actions || 'Actions'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                      {Array.isArray(users) && users.map((user) => (
                        <tr key={user.id} className={user.blocked ? "bg-red-50 dark:bg-red-900/20" : ""}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {user.username}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {user.role === 'admin' ? (t.admin || 'Admin') : (t.user || 'User')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.blocked 
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' 
                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            }`}>
                              {user.blocked ? (t.blockedAccount || 'Blocked') : (t.active || 'Active')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            {user.role !== 'admin' && (
                              <>
                                <button
                                  onClick={() => handleBlockUser(user.id, user.blocked)}
                                  className={`${user.blocked ? 'text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300' : 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'}`}
                                >
                                  {user.blocked ? (t.unblock || 'Unblock') : (t.block || 'Block')}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                >
                                  {t.delete || 'Delete'}
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-lg mx-auto"
              >
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {t.applicationSettings || 'Application Settings'}
                </h2>
                
                <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="site-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t.siteName || 'Site Name'}
                        </label>
                        <input
                          type="text"
                          name="site-name"
                          id="site-name"
                          className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm dark:bg-gray-700 dark:text-white p-2"
                          placeholder="Travel App"
                          value={settings.siteName}
                          onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="site-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t.siteDescription || 'Site Description'}
                        </label>
                        <textarea
                          id="site-description"
                          name="site-description"
                          rows={3}
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm dark:bg-gray-700 dark:text-white p-2"
                          placeholder="Find the best places around you"
                          value={settings.siteDescription}
                          onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                        />
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="enable-registration"
                            name="enable-registration"
                            type="checkbox"
                            className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 dark:border-gray-600 rounded"
                            checked={settings.enableRegistration}
                            onChange={(e) => setSettings({ ...settings, enableRegistration: e.target.checked })}
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="enable-registration" className="font-medium text-gray-700 dark:text-gray-300">
                            {t.enableRegistration || 'Enable User Registration'}
                          </label>
                          <p className="text-gray-500 dark:text-gray-400">
                            {t.enableRegistrationDesc || 'Allow new users to register on the site'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleSaveSettings}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          {t.saveSettings || 'Save Settings'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Confirmation modals */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {confirmAction.type === 'delete' 
                ? (t.confirmDelete || 'Are you sure you want to delete this user?')
                : confirmAction.type === 'block'
                  ? (t.confirmBlock || 'Are you sure you want to block this user?')
                  : (t.confirmUnblock || 'Are you sure you want to unblock this user?')
              }
            </h3>
            <div className="flex justify-end space-x-3">
              <button
                onClick={confirmAction.cancel}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                {t.cancel || 'Cancel'}
              </button>
              <button
                onClick={confirmAction.confirm}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                {t.confirm || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;