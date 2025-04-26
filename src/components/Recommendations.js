import React, { useState, useEffect } from 'react';
import { useShoppingContext } from '../context/ShoppingContext';

const Recommendations = () => {
  const { getRecommendations, createShoppingList } = useShoppingContext();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState({});
  const [listName, setListName] = useState('Recommended List');

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const recs = await getRecommendations();
        setRecommendations(recs);
        
        // Initialize selected items state
        const initialSelected = {};
        recs.forEach(item => {
          initialSelected[item.id] = true; // Select all by default
        });
        setSelectedItems(initialSelected);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [getRecommendations]);

  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const createListFromRecommendations = () => {
    // Filter items that are selected
    const items = recommendations
      .filter(item => selectedItems[item.id])
      .map(item => ({
        id: item.id,
        name: item.name,
        quantity: '',
        checked: false
      }));

    if (items.length === 0) {
      alert('Please select at least one item for your list');
      return;
    }

    // Create a new shopping list with selected items
    createShoppingList({
      name: listName,
      items
    });

    // Reset form
    setListName('Recommended List');
  };

  const selectAll = (select = true) => {
    const newSelectedState = {};
    recommendations.forEach(item => {
      newSelectedState[item.id] = select;
    });
    setSelectedItems(newSelectedState);
  };

  if (loading) {
    return (
      <div className="loader">
        <div className="loader-circle"></div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="empty-state">
        <i className="fas fa-lightbulb"></i>
        <h2>No Recommendations Yet</h2>
        <p>Create and complete shopping lists to get personalized recommendations.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-body">
        <div className="form-group">
          <label className="form-label" htmlFor="list-name">New List Name</label>
          <input
            type="text"
            id="list-name"
            className="form-control"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            placeholder="Enter list name"
          />
        </div>

        <div className="recommendation-actions">
          <button className="btn btn-outline" onClick={() => selectAll(true)}>
            Select All
          </button>
          <button className="btn btn-outline" onClick={() => selectAll(false)}>
            Deselect All
          </button>
        </div>

        <ul className="recommendation-list">
          {recommendations.map((item) => (
            <li key={item.id} className="recommendation-item">
              <input
                type="checkbox"
                checked={!!selectedItems[item.id]}
                onChange={() => toggleItemSelection(item.id)}
              />
              <div className="recommendation-text">
                <span>{item.name}</span>
              </div>
              <span className="recommendation-confidence">
                {Math.round(item.confidence * 100)}%
              </span>
            </li>
          ))}
        </ul>

        <button 
          className="btn btn-primary create-list-btn"
          onClick={createListFromRecommendations}
        >
          <i className="fas fa-plus"></i> Create List from Selected
        </button>
      </div>
    </div>
  );
};

export default Recommendations;
