import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint đơn giản để test
app.get('/api/coaches', (req, res) => {
  res.json({
    success: true,
    message: 'Test endpoint successful',
    data: [
      {
        id: 1,
        username: 'coach_test',
        email: 'coach@example.com',
        full_name: 'Coach Test',
        role: 'coach',
        avatar_url: 'https://randomuser.me/api/portraits/men/1.jpg',
        avg_rating: 4.5,
        review_count: 10
      }
    ]
  });
});

// Test chi tiết
app.get('/api/coaches/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Coach fetched successfully',
    data: {
      id: req.params.id,
      username: 'coach_test',
      email: 'coach@example.com',
      full_name: 'Coach Test',
      role: 'coach',
      avatar_url: 'https://randomuser.me/api/portraits/men/1.jpg',
      avg_rating: 4.5,
      review_count: 10
    }
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log('Test endpoints:');
  console.log(`- GET http://localhost:${PORT}/api/coaches`);
  console.log(`- GET http://localhost:${PORT}/api/coaches/1`);
});
