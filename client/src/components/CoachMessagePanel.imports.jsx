import React, { useState, useEffect, useRef } from 'react';
import { FaComments, FaPaperPlane, FaTimes } from 'react-icons/fa';
import { getAppointmentMessages, sendAppointmentMessage, markMessagesAsRead } from '../utils/coachApiIntegration';
import { 
  initSocket, 
  joinAppointmentRoom, 
  sendMessage,
  subscribeToMessages, 
  subscribeToMessagesRead,
  markMessagesAsRead as socketMarkMessagesAsRead
} from '../utils/socket';
import '../styles/CoachMessagePanel.css';
