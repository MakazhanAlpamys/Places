import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser, selectIsAuthenticated, selectIsAdmin, selectCurrentUser } from '../redux/authSlice';
import { setLanguage, selectTranslation } from '../redux/languageSlice';

function Navbar() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const current = useSelector((state) => state.language.current);
  const t = useSelector(selectTranslation);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAdmin = useSelector(selectIsAdmin);

  // Toggle menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Toggle user menu
  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };
  
  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen) {
        setIsUserMenuOpen(false);
      }
    };
    
    // Add when the component mounts
    document.addEventListener('mousedown', handleClickOutside);
    // Return function to be called when unmounted
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // Handle scroll event
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Handle language change
  const handleLanguageChange = (lang) => {
    dispatch(setLanguage(lang));
  };

  // Handle logout
  const handleLogout = (e) => {
    if (e) e.preventDefault();
    
    console.log('Navbar: Начинаем процесс выхода из системы...');
    
    try {
      // Временно отключаем кнопки для предотвращения повторных нажатий
      const buttons = document.querySelectorAll('button');
      buttons.forEach(btn => {
        if (btn.getAttribute('data-logout-button')) {
          btn.disabled = true;
        }
      });
      
      // Запускаем процесс выхода
      dispatch(logoutUser())
        .then(() => {
          console.log('Navbar: Выход выполнен успешно');
          
          // Для надежности делаем прямую очистку localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Закрыть меню пользователя
          setIsUserMenuOpen(false);
          setIsMenuOpen(false);
          
          // Навигация на страницу логина с небольшой задержкой
          setTimeout(() => {
            console.log('Navbar: Перенаправление на /login');
            navigate('/login', { replace: true });
            window.location.reload(); // Принудительное обновление страницы
          }, 200);
        })
        .catch(error => {
          console.error('Navbar: Ошибка при выходе из системы:', error);
          
          // Экстренное решение в случае ошибки
          localStorage.clear();
          
          // Прямая навигация через window.location
          window.location.href = '/login';
        });
    } catch (error) {
      console.error('Navbar: Критическая ошибка при выходе из системы:', error);
      
      // Экстренное решение в случае ошибки
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  // Меню пользователя - контент
  const renderUserMenu = () => (
    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 ring-1 ring-black ring-opacity-5">
      <Link
        to="/profile"
        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={() => setIsUserMenuOpen(false)}
      >
        {t.profile || 'Профиль'}
      </Link>
      
      {isAdmin && (
        <Link
          to="/admin"
          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 bg-green-50 dark:bg-green-900/20"
          onClick={() => setIsUserMenuOpen(false)}
        >
          {t.adminPanel || 'Админ-панель'} 
          <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
            {t.admin || 'Админ'}
          </span>
        </Link>
      )}
      
      <div className="border-t border-gray-100 dark:border-gray-700"></div>
      
      <button
        data-logout-button="true"
        onClick={(e) => {
          setIsUserMenuOpen(false);
          handleLogout(e);
        }}
        className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
      >
        {t.logout || 'Выйти'}
      </button>
    </div>
  );

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold text-green-600">TravelApp</Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link 
              to="/" 
              className={`relative px-4 py-2.5 text-base font-medium rounded-md transition-colors duration-300 ${
                location.pathname === '/' 
                  ? 'text-white bg-green-600 shadow-md hover:bg-green-700 border-2 border-green-500' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-green-600 hover:bg-green-100 dark:hover:text-green-400 dark:hover:bg-green-900/20 border-2 border-transparent'
              }`}
            >
              {t.home || 'Главная'}
            </Link>
            <Link 
              to="/places" 
              className={`relative px-4 py-2.5 text-base font-medium rounded-md transition-colors duration-300 ${
                location.pathname === '/places' || location.pathname.includes('/places/') 
                  ? 'text-white bg-green-600 shadow-md hover:bg-green-700 border-2 border-green-500' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-green-600 hover:bg-green-100 dark:hover:text-green-400 dark:hover:bg-green-900/20 border-2 border-transparent'
              }`}
            >
              {t.places || 'Места'}
            </Link>
            <Link 
              to="/contacts" 
              className={`relative px-4 py-2.5 text-base font-medium rounded-md transition-colors duration-300 ${
                location.pathname === '/contacts' 
                  ? 'text-white bg-green-600 shadow-md hover:bg-green-700 border-2 border-green-500' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-green-600 hover:bg-green-100 dark:hover:text-green-400 dark:hover:bg-green-900/20 border-2 border-transparent'
              }`}
            >
              {t.contacts || 'Контакты'}
            </Link>

            {/* User related links */}
            {isAuthenticated && user ? (
              <div className="relative ml-3">
                <div className="flex items-center">
                  {/* Выделенная кнопка профиля */}
                  <Link 
                    to="/profile"
                    className={`mr-4 text-base font-medium px-4 py-2.5 rounded-md transition-colors duration-300 ${
                      location.pathname === '/profile' 
                        ? 'bg-green-600 text-white shadow-md border-2 border-green-500' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 border-2 border-transparent'
                    }`}
                  >
                    {t.profile || 'Профиль'}
                  </Link>
                  
                  {/* Кнопка пользователя с выпадающим меню */}
                  <button
                    type="button"
                    className="flex items-center space-x-2 text-base font-medium rounded-full focus:outline-none"
                    onClick={toggleUserMenu}
                  >
                    <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold border-2 border-green-500">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">{user?.username}</span>
                  </button>
                </div>

                {isUserMenuOpen && renderUserMenu()}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`text-base font-medium px-4 py-2.5 rounded-md transition-colors duration-300 border-2 ${
                    location.pathname === '/login'
                      ? 'bg-green-600 text-white border-green-500 shadow-md' 
                      : 'border-green-500 text-green-600 dark:text-green-500 hover:bg-green-600 hover:text-white dark:hover:bg-green-600'
                  }`}
                >
                  {t.login || 'Войти'}
                </Link>
                <Link
                  to="/register"
                  className={`inline-flex items-center px-4 py-2.5 border-2 text-base font-medium rounded-md shadow-sm transition-colors duration-300 ${
                    location.pathname === '/register'
                      ? 'text-white bg-green-600 border-green-500'
                      : 'text-white bg-green-600 hover:bg-green-700 border-green-500'
                  }`}
                >
                  {t.register || 'Регистрация'}
                </Link>
              </>
            )}

            {/* Language switcher */}
            <div className="flex space-x-2 ml-4">
              <button
                onClick={() => handleLanguageChange('en')}
                className={`px-3 py-1.5 text-sm font-medium rounded ${current === 'en' ? 'bg-green-600 text-white shadow-sm' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
              >
                EN
              </button>
              <button
                onClick={() => handleLanguageChange('ru')}
                className={`px-3 py-1.5 text-sm font-medium rounded ${current === 'ru' ? 'bg-green-600 text-white shadow-sm' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
              >
                RU
              </button>
              <button
                onClick={() => handleLanguageChange('kz')}
                className={`px-3 py-1.5 text-sm font-medium rounded ${current === 'kz' ? 'bg-green-600 text-white shadow-sm' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
              >
                KZ
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            {isAuthenticated && user && (
              <Link 
                to="/profile"
                className={`mr-4 text-base font-medium ${
                  location.pathname === '/profile' 
                    ? 'text-green-600' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold border-2 border-green-500">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              </Link>
            )}
            
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400"
              aria-controls="mobile-menu"
              aria-expanded="false"
              onClick={toggleMenu}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden bg-white dark:bg-gray-900 shadow-lg`} id="mobile-menu">
        <div className="pt-2 pb-3 space-y-1 border-b border-gray-200 dark:border-gray-700">
          <Link
            to="/"
            className={`block px-4 py-3 text-base font-medium rounded-md mb-1 ${
              location.pathname === '/' 
                ? 'text-white bg-green-600 shadow-md mx-2 border-l-4 border-green-700' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 mx-2'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            {t.home || 'Главная'}
          </Link>
          <Link
            to="/places"
            className={`block px-4 py-3 text-base font-medium rounded-md mb-1 ${
              location.pathname === '/places' || location.pathname.includes('/places/') 
                ? 'text-white bg-green-600 shadow-md mx-2 border-l-4 border-green-700' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 mx-2'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            {t.places || 'Места'}
          </Link>
          <Link
            to="/contacts"
            className={`block px-4 py-3 text-base font-medium rounded-md mb-1 ${
              location.pathname === '/contacts' 
                ? 'text-white bg-green-600 shadow-md mx-2 border-l-4 border-green-700' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 mx-2'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            {t.contacts || 'Контакты'}
          </Link>
        </div>

        {/* User related links for mobile */}
        <div className="pt-4 pb-3 border-b border-gray-200 dark:border-gray-700">
          {isAuthenticated && user ? (
            <div>
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold border-2 border-green-400">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800 dark:text-gray-200">{user?.username}</div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{user?.email}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Link
                  to="/profile"
                  className={`block px-4 py-2 text-base font-medium rounded-md mx-2 ${
                    location.pathname === '/profile'
                      ? 'text-white bg-green-600 shadow-md border-l-4 border-green-700'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t.profile || 'Профиль'}
                </Link>
                
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className={`block px-4 py-2 text-base font-medium rounded-md mx-2 ${
                      location.pathname === '/admin'
                        ? 'text-white bg-green-600 shadow-md border-l-4 border-green-700'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t.admin || 'Админ панель'}
                  </Link>
                )}
                
                <button
                  onClick={(e) => {
                    handleLogout(e);
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 mx-2 rounded-md"
                >
                  {t.logout || 'Выйти'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 px-4">
              <Link
                to="/login"
                className={`block py-2 px-4 text-base font-medium rounded-md mx-2 ${
                  location.pathname === '/login'
                    ? 'bg-green-600 text-white border-l-4 border-green-700'
                    : 'text-green-600 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 border border-green-500'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t.login || 'Войти'}
              </Link>
              <Link
                to="/register"
                className={`block py-2 px-4 text-base font-medium rounded-md mx-2 ${
                  location.pathname === '/register'
                    ? 'bg-green-700 text-white border-l-4 border-green-800'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t.register || 'Регистрация'}
              </Link>
            </div>
          )}
        </div>

        {/* Language switcher for mobile */}
        <div className="pt-4 pb-3 px-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{t.language || 'Язык'}</p>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                handleLanguageChange('en');
                setIsMenuOpen(false);
              }}
              className={`px-3 py-2 text-sm font-medium rounded ${current === 'en' ? 'bg-green-600 text-white shadow-sm' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              English
            </button>
            <button
              onClick={() => {
                handleLanguageChange('ru');
                setIsMenuOpen(false);
              }}
              className={`px-3 py-2 text-sm font-medium rounded ${current === 'ru' ? 'bg-green-600 text-white shadow-sm' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              Русский
            </button>
            <button
              onClick={() => {
                handleLanguageChange('kz');
                setIsMenuOpen(false);
              }}
              className={`px-3 py-2 text-sm font-medium rounded ${current === 'kz' ? 'bg-green-600 text-white shadow-sm' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              Қазақша
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 