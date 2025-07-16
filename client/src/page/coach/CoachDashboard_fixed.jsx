import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaCalendarAlt, FaUsers, FaCheckCircle, FaClock, FaChartBar, FaComments, FaSearch, FaBell, FaUserMd, FaCheck, FaPaperPlane, FaTimes, FaRobot } from 'react-icons/fa';
import '../../styles/CoachDashboard.css';
import { initializeCoachMessages } from '../../utils/coachMessages';
// Import các hàm API tích hợp
import { 
  getCoachDashboardStats, 
  getCoachAppointments, 
  getAppointmentMessages, 
  sendAppointmentMessage, 
  markMessagesAsRead, 
  getUnreadMessageCounts 
} from '../../utils/coachApiIntegration';

function CoachDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    completedBookings: 0,
    totalClients: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // New messaging states
  const [activeTab, setActiveTab] = useState('dashboard');
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showMessaging, setShowMessaging] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCounts, setUnreadCounts] = useState({});
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [hasNewUserMessage, setHasNewUserMessage] = useState(false);
  const pollingIntervalRef = useRef(null);
  const lastMessageCountRef = useRef({});

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  // New useEffect for loading appointments and unread counts
  useEffect(() => {
    if (user?.role === 'coach') {
      loadCoachAppointments();
      loadUnreadCounts();
      
      // Set up polling for unread counts every 3 seconds
      const unreadPolling = setInterval(() => {
        loadUnreadCounts();
      }, 3000);
      
      return () => clearInterval(unreadPolling);
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user || user.role !== 'coach') {
      setLoading(false);
      return;
    }

    try {
      // Sử dụng hàm getCoachDashboardStats từ API integration
      const dashboardData = await getCoachDashboardStats();
      
      if (dashboardData) {
        setStats({
          totalBookings: dashboardData.totalBookings || 0,
          upcomingBookings: dashboardData.upcomingBookings || 0,
          completedBookings: dashboardData.completedBookings || 0,
          totalClients: dashboardData.totalClients || 0
        });
        
        setRecentBookings(dashboardData.recentBookings || []);
        setLoading(false);
        return;
      }
      
      // Fallback to localStorage if API returns no data
      const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      
      // Filter only appointments for current coach
      const coachBookings = allAppointments.filter(appointment => {
        try {
          return appointment.coachName === user.fullName || appointment.coachName === user.name;
        } catch (error) {
          console.error('Error filtering coach appointments:', error);
          return false;
        }
      });

      // Calculate statistics
      const now = new Date();
      const upcomingBookings = coachBookings.filter(booking => {
        const appointmentDate = new Date(booking.date);
        return appointmentDate >= now && booking.status !== 'cancelled';
      });

      const completedBookings = coachBookings.filter(booking => 
        booking.status === 'completed' || booking.completed === true
      );

      // Get unique clients
      const uniqueClients = [...new Set(coachBookings.map(booking => booking.userId))];

      setStats({
        totalBookings: coachBookings.length,
        upcomingBookings: upcomingBookings.length,
        completedBookings: completedBookings.length,
        totalClients: uniqueClients.length
      });

      // Get 5 most recent bookings
      const sortedBookings = coachBookings
        .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
        .slice(0, 5);

      setRecentBookings(sortedBookings);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      
      try {
        // Fallback to localStorage on error
        const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        const coachBookings = allAppointments.filter(appointment => 
          appointment.coachName === user?.fullName || appointment.coachName === user?.name
        );
        
        const now = new Date();
        const upcomingBookings = coachBookings.filter(booking => {
          const appointmentDate = new Date(booking.date);
          return appointmentDate >= now && booking.status !== 'cancelled';
        });

        const completedBookings = coachBookings.filter(booking => 
          booking.status === 'completed' || booking.completed === true
        );

        const uniqueClients = [...new Set(coachBookings.map(booking => booking.userId))];
        
        setStats({
          totalBookings: coachBookings.length,
          upcomingBookings: upcomingBookings.length,
          completedBookings: completedBookings.length,
          totalClients: uniqueClients.length
        });
        
        // Get 5 most recent bookings
        const sortedBookings = coachBookings
          .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
          .slice(0, 5);
        
        setRecentBookings(sortedBookings);
      } catch (innerError) {
        console.error('Error with fallback:', innerError);
      }
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật hàm loadCoachAppointments sử dụng API
  const loadCoachAppointments = async () => {
    try {
      const appointments = await getCoachAppointments();
      if (appointments && Array.isArray(appointments)) {
        setAppointments(appointments);
      } else {
        // Fallback to localStorage
        const storedAppointments = JSON.parse(localStorage.getItem('appointments')) || [];
        const coachAppointments = storedAppointments.filter(
          app => app && app.coachName && (app.coachName === user?.fullName || app.coachName === user?.name)
        );
        setAppointments(coachAppointments);
      }
    } catch (error) {
      console.error('Error loading coach appointments:', error);
      // Fallback to localStorage
      try {
        const storedAppointments = JSON.parse(localStorage.getItem('appointments')) || [];
        const coachAppointments = storedAppointments.filter(
          app => app && app.coachName && (app.coachName === user?.fullName || app.coachName === user?.name)
        );
        setAppointments(coachAppointments);
      } catch (e) {
        console.error('Error with fallback to localStorage:', e);
        setAppointments([]);
      }
    }
  };

  // Cập nhật hàm loadUnreadCounts sử dụng API
  const loadUnreadCounts = async () => {
    try {
      // Use the getUnreadMessageCounts service function
      const data = await getUnreadMessageCounts();
      
      if (data) {
        setUnreadCounts(data);
      } else {
        // Fallback to localStorage if API fails
        const storedAppointments = JSON.parse(localStorage.getItem('appointments')) || [];
        const coachAppointments = storedAppointments.filter(
          app => app && app.coachName && (app.coachName === user?.fullName || app.coachName === user?.name)
        );
        
        const counts = {};
        coachAppointments.forEach(appointment => {
          if (appointment && appointment.id) {
            const chatKey = `coach_chat_${appointment.id}`;
            const messages = JSON.parse(localStorage.getItem(chatKey)) || [];
            const unreadCount = messages.filter(msg => 
              msg && msg.sender === 'user' && !msg.readByCoach
            ).length;
            counts[appointment.id] = unreadCount;
          }
        });
        
        setUnreadCounts(counts);
      }
    } catch (error) {
      console.error('Error loading unread counts:', error);
      // Fallback to localStorage
      try {
        const storedAppointments = JSON.parse(localStorage.getItem('appointments')) || [];
        const coachAppointments = storedAppointments.filter(
          app => app && app.coachName && (app.coachName === user?.fullName || app.coachName === user?.name)
        );
        
        const counts = {};
        coachAppointments.forEach(appointment => {
          if (appointment && appointment.id) {
            const chatKey = `coach_chat_${appointment.id}`;
            const messages = JSON.parse(localStorage.getItem(chatKey)) || [];
            const unreadCount = messages.filter(msg => 
              msg && msg.sender === 'user' && !msg.readByCoach
            ).length;
            counts[appointment.id] = unreadCount;
          }
        });
        
        setUnreadCounts(counts);
      } catch (e) {
        console.error('Error with fallback to localStorage:', e);
        setUnreadCounts({});
      }
    }
  };

  // Cập nhật hàm handleSendMessage sử dụng API
  const handleSendMessage = async (appointmentId, messageText) => {
    if (!messageText.trim()) return;
    
    try {
      // Use the sendAppointmentMessage service function
      await sendAppointmentMessage(appointmentId, {
        text: messageText.trim(),
        sender: 'coach'
      });
      
      // Refresh messages after sending
      if (selectedAppointment?.id === appointmentId) {
        // Clear input field after sending
        setMessageInput('');
        // Reload messages to see the newly sent message
        await loadMessagesForActiveChat();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Fallback to localStorage if API fails
      const chatKey = `coach_chat_${appointmentId}`;
      const existingMessages = JSON.parse(localStorage.getItem(chatKey)) || [];
      
      const newMessage = {
        id: existingMessages.length + 1,
        text: messageText.trim(),
        sender: 'coach',
        timestamp: new Date().toISOString(),
        readByUser: false
      };

      const updatedMessages = [...existingMessages, newMessage];
      localStorage.setItem(chatKey, JSON.stringify(updatedMessages));

      // Mark as unread for user
      const userUnreadKey = `unread_messages_${appointmentId}`;
      const currentUserUnread = parseInt(localStorage.getItem(userUnreadKey) || '0');
      localStorage.setItem(userUnreadKey, (currentUserUnread + 1).toString());

      // Update local messages if this is the active chat
      if (selectedAppointment?.id === appointmentId) {
        setMessages(updatedMessages);
        setMessageInput('');
      }
    }
  };

  // Cập nhật hàm loadMessagesForActiveChat sử dụng API
  const loadMessagesForActiveChat = async () => {
    if (!selectedAppointment) return;
    
    try {
      // Use the getAppointmentMessages service function
      const data = await getAppointmentMessages(selectedAppointment.id);
      
      if (data && Array.isArray(data)) {
        // Check if there are new messages from user
        const currentCount = data.length;
        const lastCount = lastMessageCountRef.current[selectedAppointment.id] || 0;
        
        if (currentCount > lastCount) {
          const newMessages = data.slice(lastCount);
          const hasUserMessages = newMessages.some(msg => msg.sender === 'user');
          
          if (hasUserMessages) {
            setHasNewUserMessage(true);
            // Auto-hide the indicator after 3 seconds
            setTimeout(() => setHasNewUserMessage(false), 3000);
          }
        }
        
        lastMessageCountRef.current[selectedAppointment.id] = currentCount;
        
        // Mark messages as read by coach
        if (data.some(msg => msg.sender === 'user' && !msg.readByCoach)) {
          await markMessagesAsRead(selectedAppointment.id);
        }
        
        setMessages(data);
        loadUnreadCounts();
      } else {
        // Fallback to localStorage if API fails
        const chatKey = `coach_chat_${selectedAppointment.id}`;
        const chatMessages = JSON.parse(localStorage.getItem(chatKey)) || [];
        
        // Check if there are new messages from user
        const currentCount = chatMessages.length;
        const lastCount = lastMessageCountRef.current[selectedAppointment.id] || 0;
        
        if (currentCount > lastCount) {
          const newMessages = chatMessages.slice(lastCount);
          const hasUserMessages = newMessages.some(msg => msg.sender === 'user');
          
          if (hasUserMessages) {
            setHasNewUserMessage(true);
            // Auto-hide the indicator after 3 seconds
            setTimeout(() => setHasNewUserMessage(false), 3000);
          }
        }
        
        lastMessageCountRef.current[selectedAppointment.id] = currentCount;
        
        // Mark messages as read by coach
        const updatedMessages = chatMessages.map(msg => ({
          ...msg,
          readByCoach: msg.sender === 'user' ? true : msg.readByCoach
        }));
        
        // Only update if messages have changed
        if (JSON.stringify(updatedMessages) !== JSON.stringify(messages)) {
          localStorage.setItem(chatKey, JSON.stringify(updatedMessages));
          setMessages(updatedMessages);
          loadUnreadCounts();
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      
      // Fallback to localStorage
      const chatKey = `coach_chat_${selectedAppointment.id}`;
      const chatMessages = JSON.parse(localStorage.getItem(chatKey)) || [];
      
      // Mark messages as read by coach
      const updatedMessages = chatMessages.map(msg => ({
        ...msg,
        readByCoach: msg.sender === 'user' ? true : msg.readByCoach
      }));
      
      localStorage.setItem(chatKey, JSON.stringify(updatedMessages));
      setMessages(updatedMessages);
      loadUnreadCounts();
    }
  };

  // Real-time polling for active chat
  useEffect(() => {
    if (showMessaging && selectedAppointment) {
      // Load messages immediately
      loadMessagesForActiveChat();
      
      // Then set up polling every 3 seconds
      pollingIntervalRef.current = setInterval(() => {
        loadMessagesForActiveChat();
      }, 3000);
    } else {
      // Clear polling when not in messaging
      clearInterval(pollingIntervalRef.current);
    }
    
    return () => {
      clearInterval(pollingIntervalRef.current);
    };
  }, [showMessaging, selectedAppointment]);

  // Phần code giao diện và xử lý sự kiện khác không thay đổi, giữ nguyên...

  return (
    <div className="coach-dashboard">
      {/* Phần giao diện không thay đổi */}
    </div>
  );
}

export default CoachDashboard;
