import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database-mysql.js';
import User from './UserMySQL.js';

// Định nghĩa Appointment model
const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  coachId: {
    type: DataTypes.STRING,
    allowNull: true // Có thể null nếu coach chưa được chỉ định
  },
  coachName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  appointmentType: {
    type: DataTypes.ENUM('consultation', 'follow_up', 'emergency'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no_show'),
    defaultValue: 'pending'
  },
  notes: {
    type: DataTypes.TEXT
  },
  meetingLink: {
    type: DataTypes.STRING
  },
  duration: {
    type: DataTypes.INTEGER, // Duration in minutes
    defaultValue: 30
  },
  feedback: {
    type: DataTypes.JSON,
    defaultValue: null
  }
}, {
  tableName: 'appointments',
  timestamps: true
});

// Thiết lập quan hệ
Appointment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Appointment, { foreignKey: 'userId', as: 'appointments' });

export default Appointment;
