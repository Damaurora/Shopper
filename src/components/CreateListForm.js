import React, { useState } from 'react';
import { useShoppingContext } from '../context/ShoppingContext';
import AutocompleteInput from './AutocompleteInput';

const CreateListForm = () => {
  const { createShoppingList } = useShoppingContext();
  
  const [listName, setListName] = useState('');
  const [items, setItems] = useState([{ id: 1, name: '', quantity: '' }]);
  const [error, setError] = useState('');

  const handleNameChange = (e) => {
    setListName(e.target.value);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { id: Date.now(), name: '', quantity: '' }]);
  };

  const removeItem = (index) => {
    if (items.length === 1) {
      // Keep at least one item row
      setItems([{ id: Date.now(), name: '', quantity: '' }]);
      return;
    }
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!listName.trim()) {
      setError('Пожалуйста, введите название списка');
      return;
    }

    // Filter out empty items
    const validItems = items.filter(item => item.name.trim());
    
    if (validItems.length === 0) {
      setError('Пожалуйста, добавьте хотя бы один товар в список');
      return;
    }

    // Create the shopping list
    createShoppingList({
      name: listName,
      items: validItems.map(item => ({
        ...item,
        checked: false
      }))
    });

    // Reset form
    setListName('');
    setItems([{ id: Date.now(), name: '', quantity: '' }]);
    setError('');
  };

  return (
    <div className="card">
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}
          
          <div className="form-group">
            <label className="form-label" htmlFor="list-name">Название списка</label>
            <input
              type="text"
              id="list-name"
              className="form-control"
              value={listName}
              onChange={handleNameChange}
              placeholder="например, Продукты на неделю"
            />
          </div>
          
          <h3 className="form-section-title">Товары</h3>
          
          {items.map((item, index) => (
            <div key={item.id} className="form-row">
              <div className="form-group flex-grow">
                <AutocompleteInput
                  value={item.name}
                  onChange={(value) => handleItemChange(index, 'name', value)}
                  placeholder="Название товара"
                />
              </div>
              
              <div className="form-group quantity-input">
                <input
                  type="text"
                  className="form-control"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  placeholder="Кол-во"
                />
              </div>
              
              <button 
                type="button" 
                className="btn btn-outline remove-btn"
                onClick={() => removeItem(index)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          ))}
          
          <button 
            type="button" 
            className="btn btn-outline add-item-btn"
            onClick={addItem}
          >
            <i className="fas fa-plus"></i> Добавить товар
          </button>
          
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              <i className="fas fa-save"></i> Сохранить список
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateListForm;
