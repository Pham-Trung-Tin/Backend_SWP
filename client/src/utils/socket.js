import { io } from 'socket.io-client';

// Socket.IO instance
let socket = null;

// Get the API base URL
const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_BASE_URL || window.location.origin;
};

// Get the auth token from multiple possible locations
const getAuthToken = () => {
  return localStorage.getItem('nosmoke_token') || 
         sessionStorage.getItem('nosmoke_token') ||
         localStorage.getItem('token') ||
         sessionStorage.getItem('token') ||
         localStorage.getItem('authToken') ||
         null;
};

/**
 * Initialize Socket.IO connection
 * @returns {Object} Socket.IO instance
 */
export const initSocket = () => {
  // If socket already exists, return it
  if (socket && socket.connected) {
    return socket;
  }
  
  // Get authentication token
  const token = getAuthToken();
  if (!token) {
    console.error('❌ No authentication token found. Cannot initialize socket connection.');
    return null;
  }
  
  console.log('🔌 Initializing socket connection...');
  
  // Create Socket.IO instance
  socket = io(getApiBaseUrl(), {
    auth: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000,
    path: '/socket.io', // Ensure the path matches the server
    transports: ['websocket', 'polling'] // Try WebSocket first, then fallback to polling
  });
  
  console.log('🔌 Attempting to connect to Socket.IO server at:', getApiBaseUrl());
  
  // Socket event handlers with enhanced debugging
  socket.on('connect', () => {
    console.log('✅ Socket connected successfully to:', getApiBaseUrl());
    console.log('📊 Socket ID:', socket.id);
  });
  
  socket.on('connect_error', (error) => {
    console.error('❌ Socket connection error:', error.message);
    console.error('🔄 Connection details:', {
      url: getApiBaseUrl(),
      path: socket.io.opts.path,
      transports: socket.io.opts.transports,
      error: error.toString()
    });
    
    // Try to reconnect after a brief delay
    setTimeout(() => {
      console.log('🔄 Attempting to reconnect...');
      socket.connect();
    }, 2000);
  });
  
  socket.on('disconnect', (reason) => {
    console.log(`🔌 Socket disconnected: ${reason}`);
    if (reason === 'io server disconnect') {
      // The server has forcefully disconnected the socket
      console.log('🔄 Server disconnected the socket, attempting to reconnect...');
      socket.connect();
    }
  });
  
  socket.on('error', (error) => {
    console.error('❌ Socket error:', error);
  });
  
  return socket;
};

/**
 * Get the Socket.IO instance
 * @returns {Object} Socket.IO instance
 */
export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

/**
 * Join an appointment room to receive real-time updates
 * @param {string|number} appointmentId - The ID of the appointment
 */
export const joinAppointmentRoom = (appointmentId) => {
  const socket = getSocket();
  if (socket) {
    socket.emit('join-appointment', appointmentId);
    console.log(`👋 Joined appointment room: ${appointmentId}`);
  }
};

/**
 * Send a message notification through Socket.IO
 * @param {string|number} appointmentId - The ID of the appointment
 */
export const sendMessageNotification = (appointmentId) => {
  const socket = getSocket();
  if (socket) {
    socket.emit('message-notification', { appointmentId });
    console.log(`🔔 Message notification sent for appointment ${appointmentId}`);
  }
};

/**
 * Send a message through Socket.IO
 * @param {string|number} appointmentId - The ID of the appointment
 * @param {string} text - The message text
 */
export const sendMessage = (appointmentId, text) => {
  const socket = getSocket();
  if (socket) {
    socket.emit('send-message', { appointmentId, text });
    console.log(`💬 Message sent to appointment ${appointmentId}`);
  }
};

/**
 * Mark messages as read through Socket.IO
 * @param {string|number} appointmentId - The ID of the appointment
 */
export const markMessagesAsRead = (appointmentId) => {
  const socket = getSocket();
  if (socket) {
    socket.emit('mark-messages-read', { appointmentId });
    console.log(`👀 Marking messages as read in appointment ${appointmentId}`);
  }
};

/**
 * Subscribe to new messages for an appointment
 * @param {string|number} appointmentId - The ID of the appointment
 * @param {Function} callback - The callback function to handle new messages
 * @returns {Function} Unsubscribe function
 */
export const subscribeToMessages = (appointmentId, callback) => {
  const socket = getSocket();
  if (!socket) return () => {};
  
  // Join the appointment room
  joinAppointmentRoom(appointmentId);
  
  // Listen for new messages
  const newMessageHandler = (message) => {
    if (message && callback) {
      callback(message);
    }
  };
  
  socket.on('new-message', newMessageHandler);
  
  // Return unsubscribe function
  return () => {
    socket.off('new-message', newMessageHandler);
  };
};

/**
 * Subscribe to messages read events
 * @param {string|number} appointmentId - The ID of the appointment
 * @param {Function} callback - The callback function to handle read status updates
 * @returns {Function} Unsubscribe function
 */
export const subscribeToMessagesRead = (appointmentId, callback) => {
  const socket = getSocket();
  if (!socket) return () => {};
  
  // Listen for messages read events
  const messagesReadHandler = (data) => {
    if (data && data.appointmentId === appointmentId && callback) {
      callback(data);
    }
  };
  
  socket.on('messages-read', messagesReadHandler);
  
  // Return unsubscribe function
  return () => {
    socket.off('messages-read', messagesReadHandler);
  };
};

export default {
  initSocket,
  getSocket,
  joinAppointmentRoom,
  sendMessage,
  sendMessageNotification,
  markMessagesAsRead,
  subscribeToMessages,
  subscribeToMessagesRead
};
