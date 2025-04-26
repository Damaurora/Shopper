import React, { useState, useEffect } from 'react';
import { useShoppingContext } from '../context/ShoppingContext';
import { getCategoryByName } from '../utils/productCategories';

const ShoppingListItem = ({ item, listId, readOnly = false }) => {
  const { updateShoppingListItem } = useShoppingContext();
  const [checked, setChecked] = useState(item.checked || false);
  const [categoryIcon, setCategoryIcon] = useState(null);

  // Определяем иконку категории при монтировании компонента
  useEffect(() => {
    if (item.name) {
      const category = getCategoryByName(item.name);
      setCategoryIcon(category ? category.icon : null);
    }
  }, [item.name]);

  const handleCheckChange = () => {
    if (readOnly) return;
    
    const newCheckedState = !checked;
    setChecked(newCheckedState);
    
    // Update the item in the context
    updateShoppingListItem(listId, item.id, {
      ...item,
      checked: newCheckedState
    });
  };

  return (
    <li className={`list-item ${checked ? 'completed' : ''}`}>
      <div className="list-item-checkbox">
        <input 
          type="checkbox" 
          checked={checked} 
          onChange={handleCheckChange}
          disabled={readOnly}
        />
      </div>
      <div className="list-item-text">
        {categoryIcon && (
          <i className={`${categoryIcon} item-category-icon`}></i>
        )}
        <span className="item-name">{item.name}</span>
        {item.quantity && <span className="item-quantity"> ({item.quantity})</span>}
      </div>
    </li>
  );
};

export default ShoppingListItem;
