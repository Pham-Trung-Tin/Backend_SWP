import { sequelize } from '../config/database-mysql.js';
import { User, Role } from './UserUpdated.js';
import { QuitSmokingPlan, ProgressTracking } from './QuitSmokingModels.js';
import { Booking, Appointment, Feedback } from './AppointmentModels.js';

// Đồng bộ hóa tất cả các model với database
const syncModels = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing models:', error);
  }
};

// Kiểm tra kết nối
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

export {
  sequelize,
  User,
  Role,
  QuitSmokingPlan,
  ProgressTracking,
  Booking,
  Appointment,
  Feedback,
  syncModels,
  testConnection
};

export default {
  sequelize,
  User,
  Role,
  QuitSmokingPlan,
  ProgressTracking,
  Booking,
  Appointment,
  Feedback,
  syncModels,
  testConnection
};
