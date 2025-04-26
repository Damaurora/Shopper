const express = require('express');
const router = express.Router();
const inMemoryDB = require('../models/inMemoryDB');
const recommender = require('../services/recommender');

// Get all shopping lists
router.get('/shopping-lists', (req, res) => {
  try {
    const lists = inMemoryDB.getAll('shoppingLists');
    res.json(lists);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching shopping lists', error: error.message });
  }
});

// Get a single shopping list by ID
router.get('/shopping-lists/:id', (req, res) => {
  try {
    const list = inMemoryDB.getById('shoppingLists', req.params.id);
    if (!list) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching shopping list', error: error.message });
  }
});

// Create a new shopping list
router.post('/shopping-lists', (req, res) => {
  try {
    const { name, items = [] } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Shopping list name is required' });
    }
    
    const newList = {
      id: Date.now().toString(),
      name,
      items: items.map(item => ({
        ...item,
        id: item.id || Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      })),
      createdAt: new Date().toISOString(),
      completed: false
    };
    
    const savedList = inMemoryDB.create('shoppingLists', newList);
    res.status(201).json(savedList);
  } catch (error) {
    res.status(500).json({ message: 'Error creating shopping list', error: error.message });
  }
});

// Update a shopping list
router.put('/shopping-lists/:id', (req, res) => {
  try {
    const { name, items, completed } = req.body;
    const id = req.params.id;
    
    // Check if list exists
    const existingList = inMemoryDB.getById('shoppingLists', id);
    if (!existingList) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }
    
    // Update the list
    const updatedList = {
      ...existingList,
      name: name !== undefined ? name : existingList.name,
      items: items !== undefined ? items : existingList.items
    };
    
    // If marking as completed, add completedAt timestamp
    if (completed && !existingList.completed) {
      updatedList.completed = true;
      updatedList.completedAt = new Date().toISOString();
    }
    
    const savedList = inMemoryDB.update('shoppingLists', id, updatedList);
    res.json(savedList);
  } catch (error) {
    res.status(500).json({ message: 'Error updating shopping list', error: error.message });
  }
});

// Delete a shopping list
router.delete('/shopping-lists/:id', (req, res) => {
  try {
    const deleted = inMemoryDB.delete('shoppingLists', req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }
    res.json({ message: 'Shopping list deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting shopping list', error: error.message });
  }
});

// Get recommendations based on shopping history
router.get('/recommendations', async (req, res) => {
  try {
    // Get completed shopping lists
    const lists = inMemoryDB.getAll('shoppingLists')
      .filter(list => list.completed);
    
    // Get current items from query params if available
    let currentItems = [];
    if (req.query.currentItems) {
      try {
        currentItems = JSON.parse(req.query.currentItems);
      } catch (e) {
        console.error('Error parsing currentItems:', e);
      }
    }
    
    // Check for force refresh parameter
    const forceRefresh = req.query.forceRefresh === 'true';
    
    // Generate recommendations using the AI service
    const aiRecommendations = await recommender.getRecommendations(lists, currentItems, forceRefresh);
    
    // Return AI recommendations if available
    if (aiRecommendations && aiRecommendations.length > 0) {
      return res.json(aiRecommendations);
    }
    
    // Fallback to basic recommendations if no AI recommendations
    return res.json([
      { id: `rec_${Date.now()}_1`, name: 'Хлеб', confidence: 0.95 },
      { id: `rec_${Date.now()}_2`, name: 'Молоко', confidence: 0.92 },
      { id: `rec_${Date.now()}_3`, name: 'Яйца', confidence: 0.88 },
      { id: `rec_${Date.now()}_4`, name: 'Помидоры', confidence: 0.85 },
      { id: `rec_${Date.now()}_5`, name: 'Огурцы', confidence: 0.82 },
    ]);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ 
      message: 'Error generating recommendations', 
      error: error.message,
      // Предоставляем базовые рекомендации даже при ошибке
      fallbackRecommendations: [
        { id: `rec_${Date.now()}_1`, name: 'Хлеб', confidence: 0.95 },
        { id: `rec_${Date.now()}_2`, name: 'Молоко', confidence: 0.92 },
        { id: `rec_${Date.now()}_3`, name: 'Яйца', confidence: 0.88 }
      ]
    });
  }
});

// Update a shopping list item
router.patch('/shopping-lists/:listId/items/:itemId', (req, res) => {
  try {
    const { listId, itemId } = req.params;
    const { checked, name, quantity } = req.body;
    
    // Get the list
    const list = inMemoryDB.getById('shoppingLists', listId);
    if (!list) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }
    
    // Find the item
    const itemIndex = list.items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in shopping list' });
    }
    
    // Update the item
    const updatedItem = {
      ...list.items[itemIndex],
      checked: checked !== undefined ? checked : list.items[itemIndex].checked,
      name: name !== undefined ? name : list.items[itemIndex].name,
      quantity: quantity !== undefined ? quantity : list.items[itemIndex].quantity
    };
    
    const updatedItems = [...list.items];
    updatedItems[itemIndex] = updatedItem;
    
    // Update the list with the modified item
    const updatedList = {
      ...list,
      items: updatedItems
    };
    
    const savedList = inMemoryDB.update('shoppingLists', listId, updatedList);
    res.json(savedList);
  } catch (error) {
    res.status(500).json({ message: 'Error updating shopping list item', error: error.message });
  }
});

module.exports = router;
