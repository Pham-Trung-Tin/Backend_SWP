import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database-mysql.js';
import { User } from './UserUpdated.js';

// Định nghĩa Booking model
const Booking = sequelize.define('Booking', {
  BookingID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'BookingID'
  },
  UserID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'UserID'
  },
  CoachUserID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'CoachUserID'
  },
  BookingDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'BookingDate'
  },
  Status: {
    type: DataTypes.STRING(20),
    defaultValue: 'Pending',
    field: 'Status'
  },
  ApprovedByUserID: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'ApprovedByUserID'
  },
  ApprovedDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'ApprovedDate'
  }
}, {
  tableName: 'Booking',
  timestamps: false
});

// Định nghĩa Appointment model
const Appointment = sequelize.define('Appointment', {
  AppointmentID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'AppointmentID'
  },
  BookingID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'BookingID'
  },
  AppointmentDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'AppointmentDate'
  },
  DurationMinutes: {
    type: DataTypes.INTEGER,
    defaultValue: 30,
    field: 'DurationMinutes'
  },
  Location: {
    type: DataTypes.STRING(255),
    field: 'Location'
  },
  Notes: {
    type: DataTypes.TEXT,
    field: 'Notes'
  },
  Status: {
    type: DataTypes.STRING(30),
    defaultValue: 'Scheduled',
    field: 'Status'
  }
}, {
  tableName: 'Appointment',
  timestamps: false
});

// Định nghĩa Feedback model
const Feedback = sequelize.define('Feedback', {
  FeedbackID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'FeedbackID'
  },
  UserID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'UserID'
  },
  CoachUserID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'CoachUserID'
  },
  Rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'Rating'
  },
  Comment: {
    type: DataTypes.TEXT,
    field: 'Comment'
  },
  FeedbackDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'FeedbackDate'
  }
}, {
  tableName: 'Feedback',
  timestamps: false
});

// Thiết lập các quan hệ
Booking.belongsTo(User, { foreignKey: 'UserID', as: 'User' });
Booking.belongsTo(User, { foreignKey: 'CoachUserID', as: 'Coach' });
Booking.belongsTo(User, { foreignKey: 'ApprovedByUserID', as: 'Approver' });

Appointment.belongsTo(Booking, { foreignKey: 'BookingID' });
Booking.hasMany(Appointment, { foreignKey: 'BookingID' });

Feedback.belongsTo(User, { foreignKey: 'UserID', as: 'User' });
Feedback.belongsTo(User, { foreignKey: 'CoachUserID', as: 'Coach' });

export { Booking, Appointment, Feedback };
export default { Booking, Appointment, Feedback };
