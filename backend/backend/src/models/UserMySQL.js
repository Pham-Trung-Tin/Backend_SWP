import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database-mysql.js';

// Định nghĩa User model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Tên là bắt buộc' },
      len: { args: [1, 50], msg: 'Tên không được vượt quá 50 ký tự' }
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: { msg: 'Email không hợp lệ' },
      notEmpty: { msg: 'Email là bắt buộc' }
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Mật khẩu là bắt buộc' },
      len: { args: [6], msg: 'Mật khẩu phải có ít nhất 6 ký tự' }
    }
  },
  // Thông tin về thuốc lá
  cigarettesPerDay: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: { args: [1], msg: 'Số điều thuốc phải lớn hơn 0' },
      max: { args: [200], msg: 'Số điều thuốc không thể vượt quá 200' }
    }
  },
  costPerPack: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: { args: [1000], msg: 'Giá tiền phải lớn hơn 1000 VNĐ' }
    }
  },
  cigarettesPerPack: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 20,
    validate: {
      min: { args: [1], msg: 'Số điều thuốc mỗi gói phải lớn hơn 0' }
    }
  },
  // Thông tin về quá trình bỏ thuốc
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  daysWithoutSmoking: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  currentStreak: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  longestStreak: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // Thông tin về membership
  membership: {
    type: DataTypes.JSON,
    defaultValue: {
      type: 'free',
      status: 'active',
      startDate: new Date(),
      expiresAt: null,
      paymentHistory: []
    }
  },
  // Thông tin về quit plan
  quitPlan: {
    type: DataTypes.JSON,
    defaultValue: null
  }
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    // Hash mật khẩu trước khi lưu
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Instance methods
User.prototype.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Static methods
User.findByEmail = async function(email) {
  return await this.findOne({ where: { email } });
};

export default User;
