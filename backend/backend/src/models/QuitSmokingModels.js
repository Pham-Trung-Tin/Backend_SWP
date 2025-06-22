import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database-mysql.js';
import { User } from './UserUpdated.js';

// Định nghĩa QuitSmokingPlan model
const QuitSmokingPlan = sequelize.define('QuitSmokingPlan', {
  PlanID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'PlanID'
  },
  UserID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'UserID'
  },
  Title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'Title'
  },
  Reason: {
    type: DataTypes.TEXT,
    field: 'Reason'
  },
  StartDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'StartDate'
  },
  ExpectedQuitDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'ExpectedQuitDate'
  },
  Description: {
    type: DataTypes.TEXT,
    field: 'Description'
  },
  Status: {
    type: DataTypes.STRING(30),
    defaultValue: 'In Progress',
    field: 'Status'
  },
  SuccessRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00,
    field: 'SuccessRate'
  }
}, {
  tableName: 'QuitSmokingPlan',
  timestamps: false
});

// Định nghĩa ProgressTracking model
const ProgressTracking = sequelize.define('ProgressTracking', {
  TrackingID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'TrackingID'
  },
  PlanID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'PlanID'
  },
  TrackingDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'TrackingDate'
  },
  Status: {
    type: DataTypes.STRING(50),
    field: 'Status'
  },
  Note: {
    type: DataTypes.TEXT,
    field: 'Note'
  },
  CravingLevel: {
    type: DataTypes.INTEGER,
    validate: {
      min: 0,
      max: 10
    },
    field: 'CravingLevel'
  }
}, {
  tableName: 'ProgressTracking',
  timestamps: false
});

// Định nghĩa quan hệ
QuitSmokingPlan.belongsTo(User, { foreignKey: 'UserID' });
User.hasMany(QuitSmokingPlan, { foreignKey: 'UserID' });

ProgressTracking.belongsTo(QuitSmokingPlan, { foreignKey: 'PlanID' });
QuitSmokingPlan.hasMany(ProgressTracking, { foreignKey: 'PlanID' });

export { QuitSmokingPlan, ProgressTracking };
export default { QuitSmokingPlan, ProgressTracking };
