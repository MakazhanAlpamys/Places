import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectTranslation } from '../redux/languageSlice';
import { 
  selectCurrentUser, 
  selectAuthLoading, 
  selectAuthError,
  selectIsAdmin,
  updateUserProfile,
  changePassword,
  clearError,
  clearSuccess,
  selectAuthSuccess,
  logoutUser
} from '../redux/authSlice';
import { motion } from 'framer-motion';
import { FaUser, FaLock, FaEnvelope, FaPen, FaCheck, FaTimes, FaSignOutAlt, FaUserShield } from 'react-icons/fa';
import Spinner from '../components/Spinner';

function Profile() {
  const [editMode, setEditMode] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [success, setSuccess] = useState(null);
  const [localError, setLocalError] = useState(null);
  const [passwordError, setPasswordError] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  
  const user = useSelector(selectCurrentUser);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const successMessage = useSelector(selectAuthSuccess);
  const isAdmin = useSelector(selectIsAdmin);
  const t = useSelector(selectTranslation);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Проверка авторизации и заполнение формы данными
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setFormData(prevFormData => ({
      ...prevFormData,
      username: user.username || '',
      email: user.email || ''
    }));
    
  }, [user, navigate]);

  // Очистка ошибок при размонтировании компонента
  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
      setLocalError(null);
    };
  }, [dispatch]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Проверка совпадения паролей
    if (name === 'newPassword' || name === 'confirmPassword') {
      const newPasswordValue = name === 'newPassword' ? value : formData.newPassword;
      const confirmValue = name === 'confirmPassword' ? value : formData.confirmPassword;
      
      if (confirmValue) {
        setPasswordsMatch(newPasswordValue === confirmValue);
        if (newPasswordValue !== confirmValue) {
          setPasswordError(t.passwordsDoNotMatch);
        } else {
          setPasswordError('');
        }
      }
    }

    // Проверка требований к паролю при вводе нового пароля
    if (name === 'newPassword') {
      const isValid = checkPasswordRequirements(value);
      if (!isValid) {
        setPasswordError(t.passwordError);
      } else if (formData.confirmPassword && value !== formData.confirmPassword) {
        setPasswordError(t.passwordsDoNotMatch);
      } else {
        setPasswordError('');
      }
    }
    
    // Очистка сообщений об успехе и ошибках
    setSuccess(null);
    setLocalError(null);
    dispatch(clearError());
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    
    try {
      console.log('Profile: Отправка данных профиля:', { username: formData.username, email: formData.email });
      
      // Отключаем кнопку на время обработки
      const saveButton = document.querySelector('[data-profile-save-button]');
      if (saveButton) saveButton.disabled = true;
      
      // Специальная обработка для хардкоженных пользователей
      if (user && (user.id === 999 || user.id === 1000)) {
        console.log('Profile: Хардкодированный пользователь, симулируем обновление');
        // Обновляем только локальное состояние Redux для хардкоженных пользователей
        dispatch({
          type: 'auth/updateUserProfile/fulfilled',
          payload: {
            ...user,
            username: formData.username,
            email: formData.email
          }
        });
        setSuccess(t.profileUpdated || 'Profile updated successfully');
        setEditMode(false);
        
        // Включаем кнопку обратно
        if (saveButton) saveButton.disabled = false;
        return;
      }
      
      // Отправка данных на сервер
      const resultAction = await dispatch(updateUserProfile({
        username: formData.username,
        email: formData.email
      }));
      
      // Если обновление успешно
      if (updateUserProfile.fulfilled.match(resultAction)) {
        console.log('Profile: Профиль успешно обновлен:', resultAction.payload);
        setSuccess(t.profileUpdated || 'Profile updated successfully');
        setEditMode(false);
      } else if (updateUserProfile.rejected.match(resultAction)) {
        console.error('Profile: Ошибка обновления профиля:', resultAction.error);
        setLocalError(resultAction.payload?.message || t.profileUpdateFailed || 'Failed to update profile');
      }
      
      // Включаем кнопку обратно
      if (saveButton) saveButton.disabled = false;
    } catch (error) {
      console.error('Profile: Ошибка при обновлении профиля:', error);
      setLocalError(t.profileUpdateError || 'An error occurred while updating profile');
      
      // Включаем кнопку обратно
      const saveButton = document.querySelector('[data-profile-save-button]');
      if (saveButton) saveButton.disabled = false;
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    
    if (!checkPasswordRequirements(formData.newPassword)) {
      setPasswordError(t.passwordError);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setPasswordError(t.passwordsDoNotMatch);
      return;
    }
    
    try {
      console.log('Profile: Отправка данных для смены пароля');
      
      // Отключаем кнопку на время обработки
      const passwordButton = document.querySelector('[data-profile-password-button]');
      if (passwordButton) passwordButton.disabled = true;
      
      // Специальная обработка для хардкоженных пользователей
      if (user && (user.id === 999 || user.id === 1000)) {
        console.log('Profile: Хардкодированный пользователь, симулируем смену пароля');
        setSuccess(t.passwordUpdated || 'Password updated successfully');
        setFormData(prevState => ({
          ...prevState,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        setChangePasswordMode(false);
        
        // Включаем кнопку обратно
        if (passwordButton) passwordButton.disabled = false;
        return;
      }
      
      // Отправка данных на сервер
      const resultAction = await dispatch(changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      }));
      
      // Если обновление успешно
      if (changePassword.fulfilled.match(resultAction)) {
        console.log('Profile: Пароль успешно изменен');
        setSuccess(t.passwordUpdated || 'Password updated successfully');
        setFormData(prevState => ({
          ...prevState,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        setChangePasswordMode(false);
      } else if (changePassword.rejected.match(resultAction)) {
        console.error('Profile: Ошибка смены пароля:', resultAction.error);
        setLocalError(resultAction.payload?.message || t.passwordUpdateFailed || 'Failed to update password');
      }
      
      // Включаем кнопку обратно
      if (passwordButton) passwordButton.disabled = false;
    } catch (error) {
      console.error('Profile: Ошибка при смене пароля:', error);
      setLocalError(t.passwordUpdateError || 'An error occurred while updating password');
      
      // Включаем кнопку обратно
      const passwordButton = document.querySelector('[data-profile-password-button]');
      if (passwordButton) passwordButton.disabled = false;
    }
  };

  // Обработчик выхода из системы
  const handleLogout = () => {
    console.log('Profile: Начинаем процесс выхода из профиля...');
    try {
      // Временно отключаем кнопку выхода
      const logoutButton = document.querySelector('[data-profile-logout-button]');
      if (logoutButton) logoutButton.disabled = true;
      
      // Запускаем процесс выхода
      dispatch(logoutUser())
        .then(() => {
          console.log('Profile: Выход выполнен успешно');
          
          // Для надежности делаем прямую очистку localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Навигация на страницу логина с небольшой задержкой
          setTimeout(() => {
            console.log('Profile: Перенаправление на /login');
            navigate('/login', { replace: true });
            
            // Для гарантии обновления состояния
            window.location.reload();
          }, 200);
        })
        .catch(error => {
          console.error('Profile: Ошибка при выходе из профиля:', error);
          
          // Экстренное решение в случае ошибки
          localStorage.clear();
          window.location.href = '/login';
        });
    } catch (error) {
      console.error('Profile: Критическая ошибка при выходе из системы:', error);
      
      // Экстренное решение в случае ошибки
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  // Для отображения ошибок - используем либо локальную ошибку, либо ошибку из Redux
  const displayError = localError || error;

  if (loading && !user) {
    return <Spinner />;
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <motion.div
      className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { 
          opacity: 1,
          transition: { duration: 0.5 }
        }
      }}
    >
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                {t.accountInformation || 'Account Information'}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                {t.personalDetails || 'Personal Details'}
              </p>
            </div>
            <div className="flex space-x-2">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FaUserShield className="-ml-1 mr-2 h-4 w-4" />
                  {t.adminPanel || 'Admin Panel'}
                </Link>
              )}
              <button
                data-profile-logout-button="true"
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <FaSignOutAlt className="-ml-1 mr-2 h-4 w-4" />
                {t.logout || 'Logout'}
              </button>
            </div>
          </div>
          
          {displayError && (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 border-l-4 border-red-400 dark:border-red-500">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaTimes className="h-5 w-5 text-red-400 dark:text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-200">
                    {displayError}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {(success || successMessage) && (
            <div className="bg-green-50 dark:bg-green-900/20 p-4 border-l-4 border-green-400 dark:border-green-500">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaCheck className="h-5 w-5 text-green-400 dark:text-green-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700 dark:text-green-200">
                    {success || successMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="px-4 py-5 sm:p-6">
            {!editMode && !changePasswordMode ? (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { 
                    opacity: 1, 
                    y: 0,
                    transition: { duration: 0.5, delay: 0.2 }
                  }
                }}
                className="space-y-6"
              >
                <div>
                  <div className="flex items-center">
                    <FaUser className="text-gray-400 dark:text-gray-500 mr-3" />
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-24">
                      {t.username || 'Username'}:
                    </span>
                    <span className="text-md text-gray-900 dark:text-white">
                      {user.username}
                    </span>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center">
                    <FaEnvelope className="text-gray-400 dark:text-gray-500 mr-3" />
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-24">
                      {t.email || 'Email'}:
                    </span>
                    <span className="text-md text-gray-900 dark:text-white">
                      {user.email}
                    </span>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                    {t.accountSettings || 'Account Settings'}
                  </h4>
                  
                  <div className="flex flex-wrap gap-4">
                    <motion.button
                      type="button"
                      onClick={() => setEditMode(true)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <FaPen className="-ml-1 mr-2 h-4 w-4" />
                      {t.editProfile || 'Edit Profile'}
                    </motion.button>
                    
                    <motion.button
                      type="button"
                      onClick={() => setChangePasswordMode(true)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FaLock className="-ml-1 mr-2 h-4 w-4" />
                      {t.changePassword || 'Change Password'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ) : editMode ? (
              <motion.form
                onSubmit={handleSubmitProfile}
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { 
                    opacity: 1, 
                    y: 0,
                    transition: { duration: 0.5, delay: 0.2 }
                  }
                }}
                className="space-y-6"
              >
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.username || 'Username'}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      type="text"
                      name="username"
                      id="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md"
                      placeholder={t.enterUsername || 'Enter username'}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.email || 'Email'}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md"
                      placeholder={t.enterEmail || 'Enter email'}
                    />
                  </div>
                </div>
                
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-right sm:px-6 flex justify-end space-x-3">
                  <motion.button
                    type="button"
                    onClick={() => setEditMode(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex justify-center items-center py-2 px-4 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <FaTimes className="-ml-1 mr-2 h-4 w-4" />
                    {t.cancel || 'Cancel'}
                  </motion.button>
                  <motion.button
                    type="submit"
                    data-profile-save-button="true"
                    onClick={handleSubmitProfile}
                    disabled={loading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {loading ? (
                      <Spinner small />
                    ) : (
                      <FaCheck className="-ml-1 mr-2 h-4 w-4" />
                    )}
                    {t.save || 'Save'}
                  </motion.button>
                </div>
              </motion.form>
            ) : (
              <motion.form
                onSubmit={handleSubmitPassword}
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { 
                    opacity: 1, 
                    y: 0,
                    transition: { duration: 0.5, delay: 0.2 }
                  }
                }}
                className="space-y-6"
              >
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                      {t.securitySettings}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {t.changePassword}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-6">
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t.currentPassword}
                      </label>
                      <div className="mt-1">
                        <input
                          type="password"
                          name="currentPassword"
                          id="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleChange}
                          className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          required
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t.newPassword}
                      </label>
                      <div className="mt-1">
                        <input
                          type="password"
                          name="newPassword"
                          id="newPassword"
                          value={formData.newPassword}
                          onChange={handleChange}
                          className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          required
                        />
                      </div>
                      {passwordError && (
                        <p className="mt-2 text-sm text-red-600" id="password-error">
                          {passwordError}
                        </p>
                      )}
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <p className="font-medium">{t.passwordRequirements}</p>
                        <ul className="list-disc pl-5 space-y-1">
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

                    <div className="sm:col-span-6">
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t.confirmPassword}
                      </label>
                      <div className="mt-1">
                        <input
                          type="password"
                          name="confirmPassword"
                          id="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-5">
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                      >
                        {loading ? t.saving : t.changePassword}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.form>
            )}
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
              {t.accountSettings || 'Account Settings'}
            </h3>
            <div className="flex flex-wrap gap-4">
              <motion.button
                type="button"
                onClick={() => setEditMode(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <FaPen className="-ml-1 mr-2 h-4 w-4" />
                {t.editProfile || 'Edit Profile'}
              </motion.button>
              
              <motion.button
                type="button"
                onClick={() => setChangePasswordMode(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaLock className="-ml-1 mr-2 h-4 w-4" />
                {t.changePassword || 'Change Password'}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Profile; 