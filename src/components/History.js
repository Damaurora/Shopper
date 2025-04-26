import React from 'react';
import { useShoppingContext } from '../context/ShoppingContext';
import { getCategoryByName } from '../utils/productCategories';

const History = () => {
  const { shoppingLists, loading } = useShoppingContext();
  
  // Filter for completed lists and sort by completion date (newest first)
  const completedLists = shoppingLists
    .filter(list => list.completed)
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

  if (loading) {
    return (
      <div className="loader">
        <div className="loader-circle"></div>
      </div>
    );
  }

  if (completedLists.length === 0) {
    return (
      <div className="empty-state">
        <i className="fas fa-history"></i>
        <h2>Нет истории покупок</h2>
        <p>Здесь появятся ваши завершенные списки покупок.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="history-stats">
        <div className="stat-card">
          <h3>{completedLists.length}</h3>
          <p>Списков завершено</p>
        </div>
        <div className="stat-card">
          <h3>{completedLists.reduce((sum, list) => sum + list.items.length, 0)}</h3>
          <p>Товаров куплено</p>
        </div>
      </div>

      <h3 className="section-title">Завершенные списки</h3>
      
      {completedLists.map(list => (
        <div key={list.id} className="card">
          <div className="card-header">
            <div>
              <h3>{list.name}</h3>
              <small>Завершён: {new Date(list.completedAt).toLocaleDateString()}</small>
            </div>
          </div>
          <div className="card-body">
            <ul className="history-list">
              {list.items.map((item, index) => (
                <li key={index} className="history-item">
                  {getCategoryByName(item.name) && (
                    <i className={`${getCategoryByName(item.name).icon} history-item-icon`}></i>
                  )}
                  <span>{item.name}</span>
                  {item.quantity && <span className="item-quantity">({item.quantity})</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};

export default History;
