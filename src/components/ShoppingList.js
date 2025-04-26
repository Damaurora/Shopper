import React, { useState } from 'react';
import ShoppingListItem from './ShoppingListItem';
import { useShoppingContext } from '../context/ShoppingContext';

const ShoppingList = () => {
  const { shoppingLists, loading, deleteShoppingList, completeShoppingList } = useShoppingContext();
  const [openListId, setOpenListId] = useState(null);

  if (loading) {
    return (
      <div className="loader">
        <div className="loader-circle"></div>
      </div>
    );
  }

  if (!shoppingLists || shoppingLists.length === 0) {
    return (
      <div className="empty-state">
        <i className="fas fa-shopping-cart"></i>
        <h2>No Shopping Lists</h2>
        <p>Create your first shopping list to get started!</p>
      </div>
    );
  }

  const toggleList = (id) => {
    setOpenListId(openListId === id ? null : id);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this shopping list?')) {
      deleteShoppingList(id);
    }
  };

  const handleComplete = (id) => {
    completeShoppingList(id);
  };

  // Group lists: active first, then completed
  const activeLists = shoppingLists.filter(list => !list.completed);
  const completedLists = shoppingLists.filter(list => list.completed);
  const groupedLists = [...activeLists, ...completedLists];

  return (
    <div>
      {groupedLists.map((list) => (
        <div 
          key={list.id} 
          className={`card ${list.completed ? 'completed-list' : ''}`}
        >
          <div 
            className="card-header" 
            onClick={() => toggleList(list.id)}
            style={{ cursor: 'pointer' }}
          >
            <div>
              <h3>{list.name}</h3>
              <small>{new Date(list.createdAt).toLocaleDateString()}</small>
            </div>
            <div className="list-actions">
              {!list.completed && (
                <button 
                  className="btn btn-outline" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleComplete(list.id);
                  }}
                >
                  <i className="fas fa-check"></i>
                </button>
              )}
              <button 
                className="btn btn-outline" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(list.id);
                }}
              >
                <i className="fas fa-trash"></i>
              </button>
              <i className={`fas fa-chevron-${openListId === list.id ? 'up' : 'down'}`}></i>
            </div>
          </div>
          
          {openListId === list.id && (
            <div className="card-body">
              {list.items.length === 0 ? (
                <p>This list is empty.</p>
              ) : (
                <ul className="shopping-list">
                  {list.items.map((item, index) => (
                    <ShoppingListItem 
                      key={index} 
                      item={item} 
                      listId={list.id}
                      readOnly={list.completed}
                    />
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ShoppingList;
