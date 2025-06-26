import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectTranslation } from '../redux/languageSlice';
import { loginUser, selectAuthLoading, selectAuthError, selectIsAuthenticated, clearError } from '../redux/authSlice';
import { motion } from 'framer-motion';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [attemptedLogin, setAttemptedLogin] = useState(false);
  const [localError, setLocalError] = useState(null);
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const t = useSelector(selectTranslation);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // Обязательно очищаем ошибки при загрузке компонента
    dispatch(clearError());
    
    // Если пользователь уже аутентифицирован, перенаправляем на домашнюю страницу
    if (isAuthenticated) {
      navigate('/');
    }
    
    // Очищаем ошибки при размонтировании компонента
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, dispatch]);

  // Обработка ошибок из Redux
  useEffect(() => {
    if (error && attemptedLogin) {
      setLocalError(error);
    } else if (!error) {
      setLocalError(null);
    }
  }, [error, attemptedLogin]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error || localError) {
      dispatch(clearError());
      setLocalError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      console.log('Login: Начинаем процесс входа в систему:', formData.email);
      
      // Отмечаем попытку входа
      setAttemptedLogin(true);
      
      // Временно отключаем кнопку
      const loginButton = document.querySelector('[data-login-button]');
      if (loginButton) loginButton.disabled = true;
      
      // Очищаем возможные ошибки перед отправкой
      dispatch(clearError());
      setLocalError(null);
      
      // Диспатчим действие loginUser
      const resultAction = await dispatch(loginUser(formData));
      
      // Проверяем результат
      if (loginUser.fulfilled.match(resultAction)) {
        console.log('Login: Успешный вход. Роль:', resultAction.payload.user.role);
        
        // Перенаправляем пользователя в зависимости от его роли
        if (resultAction.payload.user.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } else if (loginUser.rejected.match(resultAction)) {
        console.error('Login: Ошибка входа в систему:', resultAction.error);
        setLocalError(resultAction.error?.message || 'Ошибка авторизации');
      }
      
      // Включаем кнопку обратно
      if (loginButton) loginButton.disabled = false;
    } catch (error) {
      console.error('Login: Критическая ошибка при входе в систему:', error);
      setLocalError('Произошла непредвиденная ошибка');
      
      // Включаем кнопку обратно
      const loginButton = document.querySelector('[data-login-button]');
      if (loginButton) loginButton.disabled = false;
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="max-w-md w-full space-y-8 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-3xl -z-10 blur-xl"></div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden p-8 relative z-10">
          <div className="text-center">
            <motion.h2 
              className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {t.login}
            </motion.h2>
            <motion.p 
              className="text-sm text-gray-600 dark:text-gray-300 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {t.loginWelcomeBack || "Welcome back! Please enter your details."}
            </motion.p>
          </div>
          
          <motion.form 
            className="space-y-6" 
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {(localError || (error && attemptedLogin)) && (
              <motion.div 
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <span className="block sm:inline">{localError || error}</span>
              </motion.div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.email}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                placeholder="name@example.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.password || "Password"}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                placeholder="••••••••"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  {t.rememberMe || "Remember me"}
                </label>
              </div>

              <a href="#" className="text-sm font-medium text-green-600 hover:text-green-500 dark:text-green-400 transition-colors">
                {t.forgotPassword || "Forgot password?"}
              </a>
            </div>
            
            <motion.button
              data-login-button="true"
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              className={`relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white font-medium bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {isLoading ? t.loggingIn || "Signing in..." : t.login}
            </motion.button>
          </motion.form>
        </div>
        
        <div className="text-center mt-4">
          <motion.p 
            className="text-sm text-gray-600 dark:text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {t.dontHaveAccount || "Don't have an account?"}{' '}
            <Link to="/register" className="font-medium text-green-600 hover:text-green-500 dark:text-green-400 transition-colors">
              {t.register}
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}

export default Login; 