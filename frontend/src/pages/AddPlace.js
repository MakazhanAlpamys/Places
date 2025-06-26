import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addPlace } from '../redux/adminSlice';
import { selectIsAdmin } from '../redux/authSlice';
import { selectTranslation } from '../redux/languageSlice';

const AddPlace = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAdmin = useSelector(selectIsAdmin);
  const t = useSelector(selectTranslation);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    location: '',
    category: 'Parks',
    phone: '',
    website: '',
    hours: '',
    rating: 4.5,
    imageUrl: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Обработчик изменения полей формы
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Очищаем ошибки при изменении поля
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Проверка обязательных полей
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = t.fieldRequired || 'Название обязательно';
    if (!formData.description.trim()) newErrors.description = t.fieldRequired || 'Описание обязательно';
    if (!formData.address.trim()) newErrors.address = t.fieldRequired || 'Адрес обязателен';
    if (!formData.location.trim()) newErrors.location = t.fieldRequired || 'Город обязателен';
    if (!formData.imageUrl.trim()) newErrors.imageUrl = t.fieldRequired || 'URL изображения обязателен';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Переключение режима предпросмотра
  const togglePreview = (e) => {
    if (e) e.preventDefault();
    if (!showPreview && !validateForm()) {
      return;
    }
    setShowPreview(!showPreview);
  };
  
  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Проверяем, является ли пользователь администратором
    if (!isAdmin) {
      alert(t.accessDenied || 'У вас нет прав для добавления мест');
      navigate('/');
      return;
    }
    
    // Валидация формы
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Подготавливаем данные для отправки
      const placeData = {
        ...formData,
        images: [formData.imageUrl],
        rating: parseFloat(formData.rating)
      };
      
      // Отправляем данные
      await dispatch(addPlace(placeData)).unwrap();
      
      // Показываем сообщение об успехе
      setSuccess(true);
      setLoading(false);
      
      // Перенаправляем через 2 секунды
      setTimeout(() => {
        navigate('/admin?tab=places');
      }, 2000);
    } catch (error) {
      setLoading(false);
      setErrors({ submit: error.message || (t.errorAddingPlace || 'Ошибка при добавлении места') });
    }
  };
  
  // Если пользователь не администратор, перенаправляем на главную страницу
  React.useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);
  
  // Категории мест
  const categories = [
    { value: 'Parks', label: t.parks || 'Парки' },
    { value: 'Museums', label: t.museums || 'Музеи' },
    { value: 'Cafes', label: t.cafes || 'Кафе' },
    { value: 'Hotels', label: t.hotels || 'Отели' },
    { value: 'Nature', label: t.nature || 'Природа' }
  ];
  
  // Если режим предпросмотра активен, показываем карточку с предпросмотром
  if (showPreview) {
    return (
      <div style={{maxWidth: '900px', margin: '20px auto', padding: '20px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
        <h1 style={{fontSize: '24px', textAlign: 'center', marginBottom: '20px', color: '#2c3e50'}}>{t.placePreview || 'Предпросмотр места'}</h1>
        
        <div style={{borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
          {/* Изображение места */}
          <div 
            style={{
              height: '300px', 
              backgroundImage: `url(${formData.imageUrl || 'https://via.placeholder.com/800x400?text=Нет+изображения'})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          
          {/* Информация о месте */}
          <div style={{padding: '20px'}}>
            <h2 style={{fontSize: '28px', fontWeight: 'bold', marginBottom: '10px'}}>{formData.name}</h2>
            
            <div style={{
              display: 'inline-block',
              backgroundColor: '#e3f2fd',
              color: '#1976d2',
              padding: '5px 10px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: 'bold',
              marginBottom: '15px'
            }}>
              {formData.category}
            </div>
            
            <div style={{marginBottom: '15px'}}>
              <span style={{
                display: 'inline-block',
                backgroundColor: '#e8f5e9',
                color: '#388e3c',
                padding: '5px 10px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                ★ {formData.rating}
              </span>
            </div>
            
            <p style={{marginBottom: '20px', lineHeight: '1.6', color: '#444'}}>{formData.description}</p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '15px',
              marginBottom: '20px'
            }}>
              <div>
                <div style={{fontWeight: 'bold', color: '#555', marginBottom: '5px'}}>{t.address || 'Адрес'}:</div>
                <div>{formData.address}</div>
              </div>
              
              <div>
                <div style={{fontWeight: 'bold', color: '#555', marginBottom: '5px'}}>{t.location || 'Город'}:</div>
                <div>{formData.location}</div>
              </div>
              
              <div>
                <div style={{fontWeight: 'bold', color: '#555', marginBottom: '5px'}}>{t.phone || 'Телефон'}:</div>
                <div>{formData.phone || (t.notSpecified || "Не указан")}</div>
              </div>
              
              <div>
                <div style={{fontWeight: 'bold', color: '#555', marginBottom: '5px'}}>{t.website || 'Сайт'}:</div>
                <div>{formData.website || (t.notSpecified || "Не указан")}</div>
              </div>
              
              <div>
                <div style={{fontWeight: 'bold', color: '#555', marginBottom: '5px'}}>{t.hours || 'Часы работы'}:</div>
                <div>{formData.hours || (t.notSpecified || "Не указаны")}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div style={{display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px'}}>
          <button 
            onClick={togglePreview}
            style={{
              padding: '10px 20px', 
              backgroundColor: '#ecf0f1', 
              color: '#34495e', 
              border: 'none', 
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {t.backToEdit || 'Назад к редактированию'}
          </button>
          
          <button 
            onClick={handleSubmit}
            disabled={loading || success}
            style={{
              padding: '10px 20px', 
              backgroundColor: success ? '#66bb6a' : loading ? '#90caf9' : '#2ecc71', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              cursor: loading || success ? 'default' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {success ? (t.placeAdded || "Место добавлено!") : loading ? (t.adding || "Добавление...") : (t.confirmAdd || "Подтвердить и добавить")}
          </button>
        </div>
      </div>
    );
  }
  
  // Основная форма
  return (
    <div style={{maxWidth: '900px', margin: '20px auto', padding: '20px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
      <h1 style={{fontSize: '24px', textAlign: 'center', marginBottom: '20px', color: '#2c3e50'}}>{t.addNewPlace || 'Добавить новое место'}</h1>
      
      {errors.submit && (
        <div style={{
          padding: '15px',
          backgroundColor: '#ffebee',
          color: '#c62828',
          borderRadius: '5px',
          marginBottom: '20px',
          fontWeight: 'bold'
        }}>
          {errors.submit}
        </div>
      )}
      
      <form onSubmit={togglePreview}>
        <div style={{marginBottom: '20px'}}>
          <label style={{display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333'}}>
            {t.name || 'Название'}: <span style={{color: 'red'}}>*</span>
          </label>
          <input 
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            style={{
              width: '100%', 
              padding: '12px', 
              border: errors.name ? '1px solid #e53935' : '1px solid #ddd', 
              borderRadius: '5px',
              fontSize: '16px'
            }}
            placeholder={t.nameExample || "Central Park"}
          />
          {errors.name && (
            <div style={{color: '#e53935', fontSize: '14px', marginTop: '5px'}}>{errors.name}</div>
          )}
        </div>
        
        <div style={{marginBottom: '20px'}}>
          <label style={{display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333'}}>
            {t.description || 'Описание'}: <span style={{color: 'red'}}>*</span>
          </label>
          <textarea 
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            style={{
              width: '100%',
              padding: '12px',
              border: errors.description ? '1px solid #e53935' : '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px',
              resize: 'vertical'
            }}
            placeholder={t.descriptionExample || "A beautiful urban park in the heart of the city..."}
          ></textarea>
          {errors.description && (
            <div style={{color: '#e53935', fontSize: '14px', marginTop: '5px'}}>{errors.description}</div>
          )}
        </div>
        
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '20px'}}>
          <div>
            <label style={{display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333'}}>
              {t.address || 'Адрес'}: <span style={{color: 'red'}}>*</span>
            </label>
            <input 
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              style={{
                width: '100%', 
                padding: '12px', 
                border: errors.address ? '1px solid #e53935' : '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px'
              }}
              placeholder={t.addressExample || "123 Park Avenue, City Center"}
            />
            {errors.address && (
              <div style={{color: '#e53935', fontSize: '14px', marginTop: '5px'}}>{errors.address}</div>
            )}
          </div>
          
          <div>
            <label style={{display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333'}}>
              {t.location || 'Город'}: <span style={{color: 'red'}}>*</span>
            </label>
            <input 
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              style={{
                width: '100%', 
                padding: '12px', 
                border: errors.location ? '1px solid #e53935' : '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px'
              }}
              placeholder={t.locationExample || "New York, USA"}
            />
            {errors.location && (
              <div style={{color: '#e53935', fontSize: '14px', marginTop: '5px'}}>{errors.location}</div>
            )}
          </div>
        </div>
        
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '20px'}}>
          <div>
            <label style={{display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333'}}>
              {t.category || 'Категория'}:
            </label>
            <select 
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={{
                width: '100%', 
                padding: '12px', 
                border: '1px solid #ddd', 
                borderRadius: '5px',
                fontSize: '16px',
                backgroundColor: 'white'
              }}
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label style={{display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333'}}>
              {t.phone || 'Телефон'}:
            </label>
            <input 
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              style={{
                width: '100%', 
                padding: '12px', 
                border: '1px solid #ddd', 
                borderRadius: '5px',
                fontSize: '16px'
              }}
              placeholder={t.phoneExample || "+1 (123) 456-7890"}
            />
          </div>
        </div>
        
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '20px'}}>
          <div>
            <label style={{display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333'}}>
              {t.website || 'Сайт'}:
            </label>
            <input 
              type="text"
              name="website"
              value={formData.website}
              onChange={handleChange}
              style={{
                width: '100%', 
                padding: '12px', 
                border: '1px solid #ddd', 
                borderRadius: '5px',
                fontSize: '16px'
              }}
              placeholder={t.websiteExample || "www.centralpark.com"}
            />
          </div>
          
          <div>
            <label style={{display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333'}}>
              {t.hours || 'Часы работы'}:
            </label>
            <input 
              type="text"
              name="hours"
              value={formData.hours}
              onChange={handleChange}
              style={{
                width: '100%', 
                padding: '12px', 
                border: '1px solid #ddd', 
                borderRadius: '5px',
                fontSize: '16px'
              }}
              placeholder={t.hoursExample || "Open 24 hours"}
            />
          </div>
        </div>
        
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '25px'}}>
          <div>
            <label style={{display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333'}}>
              {t.rating || 'Рейтинг'}:
            </label>
            <input 
              type="number"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              min="0"
              max="5"
              step="0.1"
              style={{
                width: '100%', 
                padding: '12px', 
                border: '1px solid #ddd', 
                borderRadius: '5px',
                fontSize: '16px'
              }}
            />
          </div>
          
          <div>
            <label style={{display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333'}}>
              {t.imageUrl || 'URL изображения'}: <span style={{color: 'red'}}>*</span>
            </label>
            <input 
              type="text"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              style={{
                width: '100%', 
                padding: '12px', 
                border: errors.imageUrl ? '1px solid #e53935' : '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px'
              }}
              placeholder={t.imageUrlExample || "https://images.unsplash.com/photo-..."}
            />
            {errors.imageUrl && (
              <div style={{color: '#e53935', fontSize: '14px', marginTop: '5px'}}>{errors.imageUrl}</div>
            )}
            <div style={{fontSize: '12px', color: '#666', marginTop: '5px'}}>
              {t.imageUrlHint || "Например: https://images.unsplash.com/photo-1534251369789-5067c8b8602a"}
            </div>
          </div>
        </div>
        
        <div style={{display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px'}}>
          <button 
            type="button" 
            onClick={() => navigate('/admin?tab=places')}
            style={{
              padding: '12px 24px', 
              backgroundColor: '#ecf0f1', 
              color: '#34495e', 
              border: 'none', 
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {t.cancel || 'Отмена'}
          </button>
          <button 
            type="submit"
            style={{
              padding: '12px 24px', 
              backgroundColor: '#3498db', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {t.preview || 'Предпросмотр'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPlace; 