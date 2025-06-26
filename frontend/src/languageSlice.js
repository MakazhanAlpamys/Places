// Проверяем, что adminPanel переведен на все языки
if (!translations.en.adminPanel) {
  translations = {
    ...translations,
    en: {
      ...translations.en,
      adminPanel: 'Admin Panel',
      adminPanelDesc: 'Manage users and content'
    },
    ru: {
      ...translations.ru,
      adminPanel: 'Админ-панель',
      adminPanelDesc: 'Управление пользователями и контентом'
    },
    kz: {
      ...translations.kz,
      adminPanel: 'Админ-панелі',
      adminPanelDesc: 'Пайдаланушыларды және контентті басқару'
    }
  };
} 