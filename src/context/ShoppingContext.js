import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { saveToStorage, loadFromStorage } from '../utils/storage';
import { getRecommendedItems } from '../utils/recommender';

// Initial state
const initialState = {
  shoppingLists: [],
  loading: false,
  error: null,
  activeTab: 'lists'
};

// Create context
const ShoppingContext = createContext(initialState);

// Action types
const Actions = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_SHOPPING_LISTS: 'SET_SHOPPING_LISTS',
  ADD_SHOPPING_LIST: 'ADD_SHOPPING_LIST',
  UPDATE_SHOPPING_LIST: 'UPDATE_SHOPPING_LIST',
  DELETE_SHOPPING_LIST: 'DELETE_SHOPPING_LIST',
  SET_ACTIVE_TAB: 'SET_ACTIVE_TAB'
};

// Reducer function
const shoppingReducer = (state, action) => {
  switch (action.type) {
    case Actions.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case Actions.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case Actions.SET_SHOPPING_LISTS:
      return { ...state, shoppingLists: action.payload, loading: false };
    
    case Actions.ADD_SHOPPING_LIST:
      return { 
        ...state, 
        shoppingLists: [...state.shoppingLists, action.payload],
        activeTab: 'lists' // Switch to lists tab after creating
      };
    
    case Actions.UPDATE_SHOPPING_LIST:
      return { 
        ...state, 
        shoppingLists: state.shoppingLists.map(list => 
          list.id === action.payload.id ? action.payload : list
        )
      };
    
    case Actions.DELETE_SHOPPING_LIST:
      return { 
        ...state, 
        shoppingLists: state.shoppingLists.filter(list => list.id !== action.payload)
      };
    
    case Actions.SET_ACTIVE_TAB:
      return { ...state, activeTab: action.payload };
    
    default:
      return state;
  }
};

// Provider component
export const ShoppingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(shoppingReducer, initialState);

  // Load shopping lists from storage
  const loadShoppingLists = useCallback(async () => {
    dispatch({ type: Actions.SET_LOADING, payload: true });
    try {
      const lists = await loadFromStorage('shopping-lists') || [];
      dispatch({ type: Actions.SET_SHOPPING_LISTS, payload: lists });
    } catch (error) {
      console.error('Error loading shopping lists:', error);
      dispatch({ type: Actions.SET_ERROR, payload: 'Failed to load shopping lists' });
    }
  }, []);

  // Save shopping lists to storage
  const saveShoppingLists = useCallback(async (lists) => {
    try {
      await saveToStorage('shopping-lists', lists);
    } catch (error) {
      console.error('Error saving shopping lists:', error);
      dispatch({ type: Actions.SET_ERROR, payload: 'Failed to save shopping lists' });
    }
  }, []);

  // Create a new shopping list
  const createShoppingList = useCallback(async (listData) => {
    const newList = {
      id: Date.now().toString(),
      name: listData.name,
      items: listData.items || [],
      createdAt: new Date().toISOString(),
      completed: false
    };

    dispatch({ type: Actions.ADD_SHOPPING_LIST, payload: newList });
    
    // Save to storage
    const updatedLists = [...state.shoppingLists, newList];
    await saveShoppingLists(updatedLists);
    
    return newList;
  }, [state.shoppingLists, saveShoppingLists]);

  // Update a shopping list item
  const updateShoppingListItem = useCallback(async (listId, itemId, updatedItem) => {
    const list = state.shoppingLists.find(l => l.id === listId);
    
    if (!list) return;
    
    const updatedList = {
      ...list,
      items: list.items.map(item => 
        item.id === itemId ? updatedItem : item
      )
    };

    dispatch({ 
      type: Actions.UPDATE_SHOPPING_LIST, 
      payload: updatedList
    });

    // Save to storage
    const updatedLists = state.shoppingLists.map(l => 
      l.id === listId ? updatedList : l
    );
    await saveShoppingLists(updatedLists);
  }, [state.shoppingLists, saveShoppingLists]);

  // Delete a shopping list
  const deleteShoppingList = useCallback(async (listId) => {
    dispatch({ type: Actions.DELETE_SHOPPING_LIST, payload: listId });
    
    // Save to storage
    const updatedLists = state.shoppingLists.filter(list => list.id !== listId);
    await saveShoppingLists(updatedLists);
  }, [state.shoppingLists, saveShoppingLists]);

  // Mark a shopping list as complete
  const completeShoppingList = useCallback(async (listId) => {
    const list = state.shoppingLists.find(l => l.id === listId);
    
    if (!list) return;
    
    const completedList = {
      ...list,
      completed: true,
      completedAt: new Date().toISOString()
    };

    dispatch({ 
      type: Actions.UPDATE_SHOPPING_LIST, 
      payload: completedList
    });

    // Save to storage
    const updatedLists = state.shoppingLists.map(l => 
      l.id === listId ? completedList : l
    );
    await saveShoppingLists(updatedLists);
  }, [state.shoppingLists, saveShoppingLists]);

  // Set active tab
  const setActiveTab = useCallback((tab) => {
    dispatch({ type: Actions.SET_ACTIVE_TAB, payload: tab });
  }, []);

  // Get recommended items
  const getRecommendations = useCallback(async () => {
    // Only use completed lists for recommendations
    const completedLists = state.shoppingLists.filter(list => list.completed);
    
    if (completedLists.length === 0) {
      return [];
    }
    
    // Use the recommender utility to generate recommendations
    const recommendations = getRecommendedItems(completedLists);
    return recommendations;
  }, [state.shoppingLists]);

  // Context value
  const value = {
    ...state,
    loadShoppingLists,
    createShoppingList,
    updateShoppingListItem,
    deleteShoppingList,
    completeShoppingList,
    setActiveTab,
    getRecommendations
  };

  return (
    <ShoppingContext.Provider value={value}>
      {children}
    </ShoppingContext.Provider>
  );
};

// Custom hook to use the context
export const useShoppingContext = () => {
  const context = useContext(ShoppingContext);
  if (!context) {
    throw new Error('useShoppingContext must be used within a ShoppingProvider');
  }
  return context;
};
