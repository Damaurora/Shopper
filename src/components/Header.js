import React from 'react';
import { useShoppingContext } from '../context/ShoppingContext';

const Header = () => {
  const { activeTab } = useShoppingContext();
  
  // Установка заголовка на основе активной вкладки
  const getTitle = () => {
    switch (activeTab) {
      case 'lists':
        return 'Мои списки покупок';
      case 'create':
        return 'Создать новый список';
      case 'recommendations':
        return 'Рекомендуемые товары';
      case 'history':
        return 'История покупок';
      default:
        return 'СмартКорзина';
    }
  };
  
  return (
    <header className="header">
      <h1>{getTitle()}</h1>
    </header>
  );
};

export default Header;
