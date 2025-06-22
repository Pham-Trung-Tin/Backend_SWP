import { sequelize } from '../config/database-mysql.js';
import User from './UserMySQL.js';
import DailyCheckin from './DailyCheckinMySQL.js';
import Appointment from './AppointmentMySQL.js';

// Import các model khác nếu cần

// Thiết lập các quan hệ giữa các model
// (Đã được thiết lập trong mỗi file model, nhưng có thể thêm các quan hệ phức tạp hơn ở đây)

// Đồng bộ hóa tất cả các model với database
const syncModels = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing models:', error);
  }
};

export {
  sequelize,
  User,
  DailyCheckin,
  Appointment,
  syncModels
};

export default {
  sequelize,
  User,
  DailyCheckin,
  Appointment,
  syncModels
};
