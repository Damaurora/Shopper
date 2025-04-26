import React, { useState } from 'react';
import { useShoppingContext } from '../context/ShoppingContext';

const ShoppingListItem = ({ item, listId, readOnly = false }) => {
  const { updateShoppingListItem } = useShoppingContext();
  const [checked, setChecked] = useState(item.checked || false);

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
        {item.name}
        {item.quantity && <span className="item-quantity"> ({item.quantity})</span>}
      </div>
    </li>
  );
};

export default ShoppingListItem;
