/**
 * In-memory database implementation
 * Simulates a simple database with collections and CRUD operations
 */

// In-memory storage object
const database = {
  shoppingLists: []
};

// Get all items from a collection
const getAll = (collection) => {
  if (!database[collection]) {
    database[collection] = [];
  }
  return [...database[collection]];
};

// Get an item by ID from a collection
const getById = (collection, id) => {
  if (!database[collection]) {
    return null;
  }
  return database[collection].find(item => item.id === id) || null;
};

// Create a new item in a collection
const create = (collection, data) => {
  if (!database[collection]) {
    database[collection] = [];
  }
  database[collection].push(data);
  return data;
};

// Update an item in a collection
const update = (collection, id, data) => {
  if (!database[collection]) {
    return null;
  }
  
  const index = database[collection].findIndex(item => item.id === id);
  if (index === -1) {
    return null;
  }
  
  database[collection][index] = data;
  return data;
};

// Delete an item from a collection
const deleteItem = (collection, id) => {
  if (!database[collection]) {
    return false;
  }
  
  const index = database[collection].findIndex(item => item.id === id);
  if (index === -1) {
    return false;
  }
  
  database[collection].splice(index, 1);
  return true;
};

// Query items with a filter function
const query = (collection, filterFn) => {
  if (!database[collection]) {
    return [];
  }
  
  return database[collection].filter(filterFn);
};

// Import sample data (for development/testing)
const importData = (data) => {
  Object.keys(data).forEach(collection => {
    database[collection] = [...(data[collection] || [])];
  });
};

// Export all database functions
module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: deleteItem,
  query,
  importData
};
