import React, { useEffect } from 'react';
import { useShoppingContext } from './context/ShoppingContext';
import Header from './components/Header';
import ShoppingList from './components/ShoppingList';
import CreateListForm from './components/CreateListForm';
import Recommendations from './components/Recommendations';
import History from './components/History';
import './App.css';

function App() {
  const { activeTab, setActiveTab, loadShoppingLists } = useShoppingContext();

  useEffect(() => {
    // Load shopping lists on app mount
    loadShoppingLists();
  }, [loadShoppingLists]);

  // Render different components based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'lists':
        return <ShoppingList />;
      case 'create':
        return <CreateListForm />;
      case 'recommendations':
        return <Recommendations />;
      case 'history':
        return <History />;
      default:
        return <ShoppingList />;
    }
  };

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        {renderContent()}
      </main>
      <nav className="bottom-nav">
        <button className={`nav-btn ${activeTab === 'lists' ? 'active' : ''}`} onClick={() => setActiveTab('lists')}>
          <i className="fas fa-list"></i>
          <span>Списки</span>
        </button>
        <button className={`nav-btn ${activeTab === 'create' ? 'active' : ''}`} onClick={() => setActiveTab('create')}>
          <i className="fas fa-plus"></i>
          <span>Создать</span>
        </button>
        <button className={`nav-btn ${activeTab === 'recommendations' ? 'active' : ''}`} onClick={() => setActiveTab('recommendations')}>
          <i className="fas fa-lightbulb"></i>
          <span>Советы</span>
        </button>
        <button className={`nav-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
          <i className="fas fa-history"></i>
          <span>История</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
