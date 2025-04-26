import React from 'react';
import { useShoppingContext } from '../context/ShoppingContext';

const Header = () => {
  const { activeTab } = useShoppingContext();
  
  // Set title based on active tab
  const getTitle = () => {
    switch (activeTab) {
      case 'lists':
        return 'My Shopping Lists';
      case 'create':
        return 'Create New List';
      case 'recommendations':
        return 'Recommended Items';
      case 'history':
        return 'Shopping History';
      default:
        return 'SmartCart';
    }
  };
  
  return (
    <header className="header">
      <h1>{getTitle()}</h1>
    </header>
  );
};

export default Header;
