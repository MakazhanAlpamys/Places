import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PlacesList from './pages/PlacesList';
import PlaceDetail from './pages/PlaceDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Contacts from './pages/Contacts';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import Footer from './components/Footer';
import { getCurrentUser, selectIsAuthenticated, selectIsAdmin, selectAuthError } from './redux/authSlice';
import AddPlace from './pages/AddPlace';

// Защищенный маршрут, доступный только авторизованным пользователям
const PrivateRoute = ({ element }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authError = useSelector(selectAuthError);
  
  if (authError) {
    console.error('Auth error in PrivateRoute:', authError);
  }
  
  return isAuthenticated ? element : <Navigate to="/login" />;
};

// Защищенный маршрут, доступный только администраторам
const AdminRoute = ({ element }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const authError = useSelector(selectAuthError);
  
  if (authError) {
    console.error('Auth error in AdminRoute:', authError);
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" />;
  }
  
  return element;
};

function App() {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme?.mode === 'dark');
  const [loading, setLoading] = useState(true);
  
  // При загрузке приложения проверяем авторизацию
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        console.log('Checking auth, token exists:', !!token);
        
        if (token) {
          // Проверяем сохраненные учетные данные для дефолтных пользователей
          if (savedUser) {
            try {
              const user = JSON.parse(savedUser);
              
              // Особая обработка для дефолтных пользователей
              if (user.email === 'admin@example.com' || user.email === 'user@example.com') {
                console.log('Используем сохраненные данные для пользователя:', user.email);
                
                // Обновляем токен для дефолтных пользователей каждые 6 часов
                const tokenTimestamp = localStorage.getItem('tokenTimestamp');
                const currentTime = new Date().getTime();
                
                if (!tokenTimestamp || (currentTime - parseInt(tokenTimestamp)) > 6 * 60 * 60 * 1000) {
                  console.log('Обновляем токен для дефолтного пользователя');
                  
                  // Используем новый токен из getCurrentUser
                  await dispatch(getCurrentUser()).unwrap();
                  
                  // Сохраняем новую временную метку
                  localStorage.setItem('tokenTimestamp', currentTime.toString());
                }
              } else {
                // Для обычных пользователей проверяем токен через API
                await dispatch(getCurrentUser()).unwrap();
              }
            } catch (error) {
              console.error('Ошибка при парсинге сохраненного пользователя:', error);
              await dispatch(getCurrentUser()).unwrap();
            }
          } else {
            // Если токен есть, но пользователя нет, получаем данные пользователя
            await dispatch(getCurrentUser()).unwrap();
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // НЕ очищаем токен для дефолтных пользователей
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          try {
            const user = JSON.parse(savedUser);
            if (user.email !== 'admin@example.com' && user.email !== 'user@example.com') {
              console.log('Очищаем токен для обычного пользователя при ошибке');
              localStorage.removeItem('token');
            }
          } catch (error) {
            // Если не смогли распарсить, на всякий случай сохраняем токен
            console.error('Ошибка при проверке пользователя:', error);
          }
        } else {
          localStorage.removeItem('token');
        }
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [dispatch]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }
  
  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="flex flex-col min-h-screen dark:bg-gray-900 dark:text-white">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/places" element={<PlacesList />} />
            <Route path="/places/add" element={<AdminRoute element={<AddPlace />} />} />
            <Route path="/places/:id" element={<PlaceDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/admin" element={<AdminRoute element={<Admin />} />} />
            <Route path="/profile" element={<PrivateRoute element={<Profile />} />} />
            <Route path="/admin/add-place" element={<AdminRoute element={<AddPlace />} />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;
