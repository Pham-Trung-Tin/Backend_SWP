const express = require('express');
const cors = require('cors');

console.log('Starting debug server...');

const app = express();
const PORT = 3000;

// Basic middleware
app.use(cors());
app.use(express.json());

console.log('Middleware configured');

// Basic test route
app.get('/', (req, res) => {
    console.log('Root route accessed');
    res.json({ message: 'Debug server is running!' });
});

app.get('/health', (req, res) => {
    console.log('Health route accessed');
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

console.log('Routes configured');

// Start server
const server = app.listen(PORT, () => {
    console.log(`✅ Debug server is running on http://localhost:${PORT}`);
    console.log('Server started successfully!');
});

// Handle errors
server.on('error', (err) => {
    console.error('❌ Server error:', err);
});

process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.close(() => {
        console.log('Server stopped');
        process.exit(0);
    });
});

console.log('Server setup complete, waiting for listen callback...');
