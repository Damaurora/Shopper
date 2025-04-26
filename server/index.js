const express = require('express');
const path = require('path');
const fs = require('fs');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000; // Changed to 5000 for Replit compatibility

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', apiRoutes);

// Проверяем, существует ли build директория
const buildPath = path.join(__dirname, '../build');
const buildExists = fs.existsSync(buildPath) && fs.existsSync(path.join(buildPath, 'index.html'));

if (buildExists) {
  // Если build директория существует, используем ее
  console.log('Serving static files from build directory');
  app.use(express.static(buildPath));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  // Если build директории нет, используем демонстрационный файл
  console.log('Build directory not found, serving demo page');
  app.use(express.static(path.join(__dirname, '../public')));
  
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/demo.html'));
  });
  
  // Служебный маршрут для проверки работоспособности сервера
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', mode: 'development' });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'production' ? null : err.message 
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit the app at https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});
