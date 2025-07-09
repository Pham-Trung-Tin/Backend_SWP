import express from 'express';
import cors from 'cors';
import { pool } from './src/config/database.js';
import Coach from './src/models/Coach.js';

// Create a simple express server for testing
const app = express();
const PORT = 5050; // Use a different port

// Middleware
app.use(express.json());
app.use(cors());

// Coach endpoints
app.get('/api/coaches', async (req, res) => {
  try {
    const coaches = await Coach.findAll();
    res.json({
      success: true,
      message: 'Coaches fetched successfully',
      data: coaches
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
});

app.get('/api/coaches/:id', async (req, res) => {
  try {
    const coach = await Coach.findById(req.params.id);
    if (!coach) {
      return res.status(404).json({
        success: false,
        message: 'Coach not found',
        data: null
      });
    }
    res.json({
      success: true,
      message: 'Coach fetched successfully',
      data: coach
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
});

app.get('/api/coaches/:id/availability', async (req, res) => {
  try {
    const availability = await Coach.getAvailability(req.params.id);
    if (!availability) {
      return res.status(404).json({
        success: false,
        message: 'Coach not found',
        data: null
      });
    }
    res.json({
      success: true,
      message: 'Coach availability fetched successfully',
      data: availability
    });
  } catch (error) {
    console.error('Error fetching coach availability:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
});

app.get('/api/coaches/:id/reviews', async (req, res) => {
  try {
    const reviews = await Coach.getReviews(req.params.id);
    if (reviews === null) {
      return res.status(404).json({
        success: false,
        message: 'Coach not found',
        data: null
      });
    }
    res.json({
      success: true,
      message: 'Coach reviews fetched successfully',
      data: reviews
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
});

console.log('Server initialized. Testing endpoints...');

// Keep the server running
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await pool.end();
  process.exit(0);
});
