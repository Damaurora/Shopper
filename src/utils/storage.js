/**
 * Storage utilities for the shopping list application
 * Uses localStorage for persistence with IndexedDB as fallback for larger data
 */

// Check if localStorage is available
const isLocalStorageAvailable = () => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

// Save data to local storage
export const saveToStorage = async (key, data) => {
  try {
    if (isLocalStorageAvailable()) {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } else {
      // Fallback to IndexedDB if localStorage is not available
      return saveToIndexedDB(key, data);
    }
  } catch (error) {
    console.error('Error saving to storage:', error);
    throw error;
  }
};

// Load data from local storage
export const loadFromStorage = async (key) => {
  try {
    if (isLocalStorageAvailable()) {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } else {
      // Fallback to IndexedDB if localStorage is not available
      return loadFromIndexedDB(key);
    }
  } catch (error) {
    console.error('Error loading from storage:', error);
    throw error;
  }
};

// Remove data from local storage
export const removeFromStorage = async (key) => {
  try {
    if (isLocalStorageAvailable()) {
      localStorage.removeItem(key);
      return true;
    } else {
      // Fallback to IndexedDB if localStorage is not available
      return removeFromIndexedDB(key);
    }
  } catch (error) {
    console.error('Error removing from storage:', error);
    throw error;
  }
};

// IndexedDB fallback functions
const DB_NAME = 'smartcart_db';
const STORE_NAME = 'smartcart_store';
const DB_VERSION = 1;

// Open IndexedDB connection
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      reject('IndexedDB error: ' + event.target.error);
    };
    
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
  });
};

// Save to IndexedDB
const saveToIndexedDB = async (key, data) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const request = store.put({ key, data });
    
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};

// Load from IndexedDB
const loadFromIndexedDB = async (key) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    const request = store.get(key);
    
    request.onsuccess = () => {
      resolve(request.result ? request.result.data : null);
    };
    
    request.onerror = () => reject(request.error);
  });
};

// Remove from IndexedDB
const removeFromIndexedDB = async (key) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const request = store.delete(key);
    
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};
