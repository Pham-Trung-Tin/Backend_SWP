// Sample coach messages for demonstration
export const initializeCoachMessages = () => {
  // Get all appointments from localStorage
  const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');

  // Initialize messages for each appointment
  appointments.forEach(appointment => {
    const chatKey = `coach_chat_${appointment.id}`;
    const existingMessages = JSON.parse(localStorage.getItem(chatKey) || '[]');
    
    // Only add messages if there are no existing messages
    if (existingMessages.length === 0) {
      const messages = [];
      
      // Add static welcome message (hardcoded, no randomness)
      messages.push({
        id: 1,
        text: "Xin chào! Tôi rất vui được hỗ trợ bạn trong hành trình cai thuốc. Hãy chia sẻ với tôi về động lực và mục tiêu của bạn nhé!",
        sender: 'coach',
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        readByUser: false
      });

      // Add static motivation message (hardcoded, no randomness)
      messages.push({
        id: 2,
        text: "Bạn đã bước ra khỏi vùng an toàn của mình! Đây là dấu hiệu của sự can đảm và quyết tâm. Hãy tiếp tục kiên trì nhé! 💪",
        sender: 'coach',
        timestamp: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
        readByUser: false
      });

      // Add static support message (hardcoded, no randomness)
      messages.push({
        id: 3,
        text: "Nếu bạn cảm thấy khó khăn hay muốn hút thuốc, hãy nhắn tin cho tôi ngay. Tôi luôn sẵn sàng hỗ trợ bạn 24/7.",
        sender: 'coach',
        timestamp: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
        readByUser: false
      });

      // Add static tip message (hardcoded, no randomness)  
      messages.push({
        id: 4,
        text: "💡 Mẹo hôm nay: Khi có cảm giác muốn hút thuốc, hãy thử kỹ thuật hít thở sâu 4-7-8. Hít vào 4 giây, giữ 7 giây, thở ra 8 giây.",
        sender: 'coach',
        timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        readByUser: false
      });

      // Save messages to localStorage
      localStorage.setItem(chatKey, JSON.stringify(messages));
      
      // Set unread count for user
      const unreadKey = `unread_messages_${appointment.id}`;
      localStorage.setItem(unreadKey, '4');
    }
  });
  
  console.log('Coach messages initialized for all appointments');
};

export default initializeCoachMessages;
