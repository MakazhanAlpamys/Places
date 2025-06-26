import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectTranslation } from '../redux/languageSlice';
import { registerUser, selectAuthLoading, selectAuthError, selectIsAuthenticated, clearError, logoutUser } from '../redux/authSlice';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaCheck, FaUser, FaEnvelope, FaLock, FaSignOutAlt } from 'react-icons/fa';

function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [step, setStep] = useState(1);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const t = useSelector(selectTranslation);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Функция проверки требований к паролю
  const checkPasswordRequirements = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    setPasswordRequirements(requirements);
    return Object.values(requirements).every(Boolean);
  };

  useEffect(() => {
    // Если пользователь уже аутентифицирован, перенаправляем на домашнюю страницу
    if (isAuthenticated) {
      navigate('/');
    }
    
    // Очищаем ошибки при размонтировании компонента
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox' && name === 'terms') {
      setTermsAccepted(checked);
    } else {
      setFormData({ ...formData, [name]: value });
      
      // Проверяем совпадение паролей при вводе
      if (name === 'confirmPassword' || (name === 'password' && formData.confirmPassword)) {
        const passwordToCheck = name === 'password' ? value : formData.password;
        const confirmToCheck = name === 'confirmPassword' ? value : formData.confirmPassword;
        setPasswordsMatch(passwordToCheck === confirmToCheck);
      }

      // Проверяем требования к паролю
      if (name === 'password') {
        const isValid = checkPasswordRequirements(value);
        if (!isValid) {
          setPasswordError('Пароль не соответствует требованиям');
        } else {
          setPasswordError('');
        }
      }
    }
    
    if (error) dispatch(clearError());
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePrevStep = () => {
    setStep(1);
    dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!checkPasswordRequirements(formData.password)) {
      setPasswordError('Пароль не соответствует требованиям');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      dispatch(clearError());
      return;
    }
    
    try {
      console.log('Register: Начинаем процесс регистрации');
      
      // Временно отключаем кнопку
      const registerButton = document.querySelector('[data-register-button]');
      if (registerButton) registerButton.disabled = true;
      
      // Очищаем неиспользуемое confirmPassword перед отправкой
      const { confirmPassword, ...registerData } = formData;
      
      // Диспатчим действие registerUser
      const resultAction = await dispatch(registerUser(registerData));
      
      // Если регистрация успешна, перенаправляем на страницу входа
      if (registerUser.fulfilled.match(resultAction)) {
        console.log('Register: Регистрация выполнена успешно');
        localStorage.setItem('registrationSuccess', 'true');
        navigate('/');
      } else if (registerUser.rejected.match(resultAction)) {
        console.error('Register: Ошибка при регистрации:', resultAction.error);
      }
      
      // Включаем кнопку обратно
      if (registerButton) registerButton.disabled = false;
    } catch (error) {
      console.error('Register: Критическая ошибка при регистрации:', error);
      // Включаем кнопку обратно
      const registerButton = document.querySelector('[data-register-button]');
      if (registerButton) registerButton.disabled = false;
    }
  };

  // Обработчик выхода из системы
  const handleLogout = () => {
    console.log('Register: Начинаем процесс выхода после регистрации...');
    try {
      // Временно отключаем кнопку выхода
      const logoutButton = document.querySelector('[data-register-logout-button]');
      if (logoutButton) logoutButton.disabled = true;
      
      // Запускаем процесс выхода
      dispatch(logoutUser())
        .then(() => {
          console.log('Register: Выход выполнен успешно');
          
          // Для надежности делаем прямую очистку localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Навигация на страницу логина с небольшой задержкой
          setTimeout(() => {
            console.log('Register: Перенаправление на /login');
            navigate('/login', { replace: true });
            
            // Для гарантии обновления состояния
            window.location.reload();
          }, 200);
        })
        .catch(error => {
          console.error('Register: Ошибка при выходе после регистрации:', error);
          
          // Экстренное решение в случае ошибки
          localStorage.clear();
          window.location.href = '/login';
        });
    } catch (error) {
      console.error('Register: Критическая ошибка при выходе из системы:', error);
      
      // Экстренное решение в случае ошибки
      localStorage.clear();
      window.location.href = '/login';
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
        {/* Background elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-green-600/20 rounded-3xl -z-10 blur-xl"></div>
        <div className="absolute -z-10 w-32 h-32 rounded-full bg-green-500/30 blur-2xl top-8 -left-10"></div>
        <div className="absolute -z-10 w-24 h-24 rounded-full bg-blue-500/30 blur-2xl bottom-8 -right-10"></div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden p-8 relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {t.register}
            </h2>
            {isAuthenticated && (
              <button
                data-register-logout-button="true"
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <FaSignOutAlt className="-ml-1 mr-2 h-4 w-4" />
                {t.logout || 'Logout'}
              </button>
            )}
          </div>
          
          {/* Progress indicators */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 1 ? 'bg-green-500 text-white' : 'bg-green-500 text-white'}`}>
                1
              </div>
              <div className={`w-12 h-1 ${step === 1 ? 'bg-gray-300 dark:bg-gray-600' : 'bg-green-500'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 1 ? 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200' : 'bg-green-500 text-white'}`}>
                2
              </div>
            </div>
          </div>
          
          {error && (
            <motion.div 
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <span className="block sm:inline">{error}</span>
            </motion.div>
          )}
          
          {step === 1 ? (
            <motion.form 
              key="step1"
              className="space-y-6" 
              onSubmit={handleNextStep}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
            >
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.username || "Username"}
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                  placeholder={t.username || "Username"}
                />
              </div>
              
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
              
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white font-medium bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300"
              >
                {t.next || "Next"}
              </motion.button>
            </motion.form>
          ) : (
            <motion.form 
              key="step2"
              className="space-y-6" 
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.password || "Password"}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                  placeholder="••••••••"
                />
                {passwordError && (
                  <p className="mt-1 text-sm text-red-600">{t.passwordError}</p>
                )}
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <p className="font-medium">{t.passwordRequirements}</p>
                  <ul className="list-disc pl-5">
                    <li className={passwordRequirements.length ? 'text-green-600' : 'text-gray-500'}>
                      {t.minChars}
                    </li>
                    <li className={passwordRequirements.uppercase ? 'text-green-600' : 'text-gray-500'}>
                      {t.upperCase}
                    </li>
                    <li className={passwordRequirements.lowercase ? 'text-green-600' : 'text-gray-500'}>
                      {t.lowerCase}
                    </li>
                    <li className={passwordRequirements.number ? 'text-green-600' : 'text-gray-500'}>
                      {t.number}
                    </li>
                    <li className={passwordRequirements.special ? 'text-green-600' : 'text-gray-500'}>
                      {t.specialChar}
                    </li>
                  </ul>
                </div>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.confirmPassword || "Confirm Password"}
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`appearance-none relative block w-full px-4 py-3 border ${!passwordsMatch ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300`}
                  placeholder="••••••••"
                />
                {!passwordsMatch && (
                  <p className="text-red-500 text-xs mt-1">{t.passwordsDoNotMatch || "Passwords do not match"}</p>
                )}
              </div>
              
              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={handleChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  {t.agreeToTerms || "I agree to the Terms of Service and Privacy Policy"}
                </label>
              </div>
              
              <div className="flex space-x-4">
                <motion.button
                  type="button"
                  onClick={handlePrevStep}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-1/3 flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-700 dark:text-white font-medium bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300"
                >
                  {t.back || "Back"}
                </motion.button>
                
                <button
                  data-register-button="true"
                  type="submit"
                  disabled={isLoading || !termsAccepted || !passwordsMatch}
                  className="w-2/3 flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white font-medium bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t.registering || 'Registering...'}
                    </div>
                  ) : (
                    t.createAccount || 'Create account'
                  )}
                </button>
              </div>
            </motion.form>
          )}
        </div>
        
        <div className="text-center mt-4">
          <motion.p 
            className="text-sm text-gray-600 dark:text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {t.alreadyHaveAccount || "Already have an account?"}{' '}
            <Link to="/login" className="font-medium text-green-600 hover:text-green-500 dark:text-green-400 transition-colors">
              {t.login}
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}

export default Register; 