import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database-mysql.js';
import User from './UserMySQL.js';

// Định nghĩa DailyCheckin model
const DailyCheckin = sequelize.define('DailyCheckin', {
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
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  smokingStatus: {
    type: DataTypes.ENUM('smoke-free', 'reduced', 'relapsed'),
    allowNull: false
  },
  cigarettesSmoked: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  mood: {
    type: DataTypes.ENUM('great', 'good', 'neutral', 'bad', 'awful'),
    allowNull: false
  },
  cravingLevel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
      max: 10
    }
  },
  withdrawalSymptoms: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  alternativeActivities: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  notes: {
    type: DataTypes.TEXT
  },
  selfRating: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1,
      max: 5
    }
  },
  tomorrowGoal: {
    type: DataTypes.STRING
  },
  stressLevel: {
    type: DataTypes.INTEGER,
    validate: {
      min: 0,
      max: 10
    }
  },
  stressFactors: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  achievements: {
    type: DataTypes.JSON,
    defaultValue: []
  }
}, {
  tableName: 'daily_checkins',
  timestamps: true,
  indexes: [
    {
      fields: ['user_id', 'date'],
      unique: true
    }
  ]
});

// Thiết lập quan hệ
DailyCheckin.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(DailyCheckin, { foreignKey: 'userId', as: 'checkins' });

export default DailyCheckin;
