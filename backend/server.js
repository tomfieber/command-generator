const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pentesting')
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Import routes
const categoriesRouter = require('./routes/categories');
const commandsRouter = require('./routes/commands');

// API routes - these must come BEFORE static file serving and catch-all
app.use('/api/categories', categoriesRouter);
app.use('/api/commands', commandsRouter);

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  // Handle React routing - catch-all handler for SPA
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  });
} else {
  // Test route for development
  app.get('/', (req, res) => {
    res.json({ message: 'Penetration Testing Command Generator API' });
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
