import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectTranslation } from '../redux/languageSlice';
import { motion } from 'framer-motion';

function Contacts() {
  const t = useSelector(selectTranslation);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setFormSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setFormSubmitted(false);
      }, 5000);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto pt-20 px-4">
      <motion.h1 
        className="text-4xl font-extrabold mb-8 text-center text-white dark:text-white bg-gradient-to-r from-green-600 to-blue-600 py-6 px-8 rounded-lg shadow-lg backdrop-blur-sm border-2 border-white/20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {t.contactUs || 'Связаться с нами'}
      </motion.h1>
      
      <motion.div 
        className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg shadow-lg p-8 mb-8 text-white overflow-hidden relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/80 to-blue-600/80 backdrop-blur-sm"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <span className="mr-2 text-2xl">✨</span>
              {t.getInTouch || 'Свяжитесь с нами'}
            </h2>
            <p className="mb-6 text-gray-100">
              {t.contactDescription || 'Есть вопросы о нашем сервисе? Хотите оставить отзыв? Наша команда готова помочь!'}
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center transform transition-transform hover:translate-x-2">
                <span className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
                  <span className="text-xl">📍</span>
                </span>
                <div>
                  <h3 className="text-sm uppercase tracking-wide font-medium opacity-75">{t.address || 'АДРЕС'}</h3>
                  <p>123 Street Name, City, Country</p>
                </div>
              </div>
              
              <div className="flex items-center transform transition-transform hover:translate-x-2">
                <span className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
                  <span className="text-xl">📞</span>
                </span>
                <div>
                  <h3 className="text-sm uppercase tracking-wide font-medium opacity-75">{t.phone || 'ТЕЛЕФОН'}</h3>
                  <p>+1 (123) 456-7890</p>
                </div>
              </div>
              
              <div className="flex items-center transform transition-transform hover:translate-x-2">
                <span className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
                  <span className="text-xl">✉️</span>
                </span>
                <div>
                  <h3 className="text-sm uppercase tracking-wide font-medium opacity-75">{t.email || 'ЭЛ. ПОЧТА'}</h3>
                  <p>contact@placefinder.com</p>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white/10 p-6 rounded-lg backdrop-blur-sm border border-white/20"
          >
            <h2 className="text-2xl font-semibold mb-4">{t.sendMessage || 'Отправить сообщение'}</h2>
            
            {formSubmitted ? (
              <motion.div 
                className="bg-green-100 border border-green-400 text-green-800 rounded-lg p-4 mt-4 flex items-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-2xl mr-2">✅</span>
                <p>Thank you! Your message has been sent.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t.name || 'Имя'}</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-3 border border-white/30 rounded bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                    placeholder={t.yourName || 'Ваше имя'}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">{t.email || 'Эл. почта'}</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-3 border border-white/30 rounded bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                    placeholder={t.yourEmail || 'Ваш email'}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">{t.message || 'Сообщение'}</label>
                  <textarea 
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full p-3 border border-white/30 rounded bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                    rows="4"
                    placeholder={t.yourMessage || 'Ваше сообщение'}
                    required
                  ></textarea>
                </div>
                
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-white text-green-600 font-medium px-4 py-3 rounded-lg hover:bg-gray-100 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex justify-center items-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''} shadow-md`}
                >
                  {isSubmitting ? (
                    <svg className="animate-spin h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : t.send || 'Отправить'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </motion.div>
      
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.8 }}
      >
        <h2 className="text-2xl font-semibold mb-6 dark:text-white flex items-center">
          <span className="mr-2 text-2xl">🕒</span> 
          {t.ourHours || 'Часы работы'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg transform transition-transform hover:scale-105 shadow-md">
            <p className="font-medium dark:text-white">{t.mondayFriday || 'Понедельник - Пятница'}</p>
            <p className="text-gray-700 dark:text-gray-300">9:00 AM - 6:00 PM</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg transform transition-transform hover:scale-105 shadow-md">
            <p className="font-medium dark:text-white">{t.saturday || 'Суббота'}</p>
            <p className="text-gray-700 dark:text-gray-300">10:00 AM - 4:00 PM</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg transform transition-transform hover:scale-105 shadow-md">
            <p className="font-medium dark:text-white">{t.sunday || 'Воскресенье'}</p>
            <p className="text-gray-700 dark:text-gray-300">{t.closed || 'Закрыто'}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Contacts; 