import app from './src/app.js';
import setupCorsMiddleware from './cors-middleware.js';
import setupStatusUpdateEndpoint from './status-update-endpoint.js';
import { Server } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';
import Message from './src/models/Message.js';

// Thiết lập CORS middleware trước khi khởi động server
setupCorsMiddleware(app);

// Thiết lập endpoint cập nhật status riêng với CORS đặc biệt
setupStatusUpdateEndpoint(app);

const PORT = process.env.PORT || 5000;  // Changed from 3000 to 5000

// const server = app.listen(PORT, () => {
//     console.log(`🚀 Server running on port ${PORT}`); // Đây là code branch Tin

// Create HTTP server
const httpServer = http.createServer(app);

// Create Socket.IO server with CORS configuration
const io = new Server(httpServer, {
    cors: {
        origin: function (origin, callback) {
            const allowedOrigins = process.env.ALLOWED_ORIGINS ?
                process.env.ALLOWED_ORIGINS.split(',') :
                ['http://localhost:5173'];

            if (!origin) return callback(null, true);
            if (origin && origin.startsWith('http://localhost:')) {
                return callback(null, true);
            }
            if (allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ["GET", "POST"]
    },
    path: '/socket.io',          // Ensure this matches the client
    transports: ['websocket', 'polling'],
    allowEIO3: true              // Support both Socket.IO v2 and v3 clients
});

console.log('📱 Socket.IO server initialized with path: /socket.io');

// Socket.IO Authentication middleware
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    const isDev = process.env.NODE_ENV === 'development';
    
    // Log connection attempt
    console.log(`🔌 Socket connection attempt - has token: ${Boolean(token)}, env: ${process.env.NODE_ENV}`);
    
    if (!token) {
        if (isDev) {
            // In development mode, allow connections without tokens for testing
            console.log('⚠️ Development mode: Allowing unauthenticated socket connection');
            return next();
        }
        return next(new Error('Authentication error: Token not provided'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_dev');
        socket.user = decoded;
        next();
    } catch (error) {
        console.error('Socket authentication error:', error);
        if (isDev) {
            // In development mode, allow connections with invalid tokens
            console.log('⚠️ Development mode: Allowing socket connection despite invalid token');
            return next();
        }
        next(new Error('Authentication error: Invalid token'));
    }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    // Check if authentication is successful
    if (!socket.user) {
        console.log(`🔌 Socket connected without authentication`);
        // Send a test event that doesn't require authentication
        socket.emit('server-info', { 
            message: 'Connected to server but not authenticated',
            socketId: socket.id,
            serverTime: new Date().toISOString()
        });
        return;
    }
    
    const userId = socket.user.id;
    const userRole = socket.user.role;
    
    console.log(`🔌 Socket connected: User ${userId} (${userRole})`);
    
    // Join room for user-specific notifications
    socket.join(`user:${userId}`);
    
    // Join rooms for each appointment the user is part of
    socket.on('join-appointment', (appointmentId) => {
        socket.join(`appointment:${appointmentId}`);
        console.log(`👋 User ${userId} joined appointment room: ${appointmentId}`);
    });
    
    // Handle new messages
    socket.on('send-message', async (data) => {
        try {
            const { appointmentId, text } = data;
            
            if (!appointmentId || !text) {
                socket.emit('error', { message: 'Appointment ID and message text are required' });
                return;
            }
            
            // Determine sender based on user role
            const sender = userRole === 'coach' ? 'coach' : 'user';
            
            // Save message to database with sender info
            const message = await Message.createMessage(appointmentId, { 
                text, 
                sender,
                userId: socket.user.id,
                userName: socket.user.name || socket.user.full_name
            });
            
            if (!message) {
                socket.emit('error', { message: 'Failed to save message' });
                return;
            }
            
            // Broadcast message to all users in the appointment room
            io.to(`appointment:${appointmentId}`).emit('new-message', message);
            
            console.log(`💬 New message in appointment ${appointmentId} from ${sender}`);
        } catch (error) {
            console.error('Error handling message:', error);
            socket.emit('error', { message: 'Failed to process message' });
        }
    });
    
    // Handle marking messages as read
    socket.on('mark-messages-read', async (data) => {
        try {
            const { appointmentId } = data;
            
            if (!appointmentId) {
                socket.emit('error', { message: 'Appointment ID is required' });
                return;
            }
            
            // Determine reader type
            const reader = userRole === 'coach' ? 'coach' : 'user';
            
            // Mark messages as read in database
            const result = await Message.markAsRead(appointmentId, reader);
            
            // Notify other users that messages have been read
            socket.to(`appointment:${appointmentId}`).emit('messages-read', {
                appointmentId,
                reader,
                count: result.count
            });
            
            console.log(`👀 ${result.count} messages marked as read in appointment ${appointmentId} by ${reader}`);
        } catch (error) {
            console.error('Error marking messages as read:', error);
            socket.emit('error', { message: 'Failed to mark messages as read' });
        }
    });
    
    // Handle message notifications
    socket.on('message-notification', async (data) => {
        try {
            const { appointmentId } = data;
            
            if (!appointmentId) {
                socket.emit('error', { message: 'Appointment ID is required' });
                return;
            }
            
            // Get the latest message for this appointment
            const latestMessage = await Message.getLatestMessage(appointmentId);
            
            if (!latestMessage) {
                socket.emit('error', { message: 'No message found for this appointment' });
                return;
            }
            
            // Broadcast the latest message to ALL users in the appointment room (including sender)
            io.to(`appointment:${appointmentId}`).emit('new-message', latestMessage);
            
            console.log(`🔔 Message notification sent for appointment ${appointmentId}`);
        } catch (error) {
            console.error('Error handling message notification:', error);
            socket.emit('error', { message: 'Failed to process message notification' });
        }
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`🔌 Socket disconnected: User ${userId}`);
    });
});

// Start server
const server = httpServer.listen(PORT, () => {
    console.log(`🚀 NoSmoke API Server running on port ${PORT}`);
    console.log(`📱 Health check: http://localhost:${PORT}/health`);
    console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`📊 Database: ${process.env.DB_NAME}@${process.env.DB_HOST}`);
    console.log(`🔌 Socket.IO real-time server running`);
});



