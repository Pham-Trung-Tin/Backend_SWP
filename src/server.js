const express = require('express');
const dotenv = require('dotenv');
const app = require('./app');
const { connectDB } = require('./config/database');

dotenv.config();

// Connect to the database
async function startServer() {
  try {
    await connectDB();
    
    // Start the server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();