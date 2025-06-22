import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database-mysql.js';

// Định nghĩa User model
const User = sequelize.define('User', {
  UserID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'UserID'
  },
  Name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'Name'
  },
  Email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    field: 'Email'
  },
  Password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'Password'
  },
  Age: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'Age'
  },
  Gender: {
    type: DataTypes.STRING(10),
    allowNull: true,
    field: 'Gender'
  },
  Phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'Phone'
  },
  Address: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'Address'
  },
  RegisterDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'RegisterDate'
  },
  RoleID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'RoleID'
  },
  IsActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'IsActive'
  },
  LastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'LastLogin'
  },
  ProfileImage: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'ProfileImage'
  },
  Membership: {
    type: DataTypes.STRING(20),
    defaultValue: 'free',
    field: 'Membership'
  }
}, {
  tableName: 'User',
  timestamps: false, // Không sử dụng createdAt, updatedAt của Sequelize
  hooks: {
    // Hash mật khẩu trước khi lưu
    beforeCreate: async (user) => {
      if (user.Password) {
        const salt = await bcrypt.genSalt(10);
        user.Password = await bcrypt.hash(user.Password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('Password')) {
        const salt = await bcrypt.genSalt(10);
        user.Password = await bcrypt.hash(user.Password, salt);
      }
    }
  }
});

// Định nghĩa Role model
const Role = sequelize.define('Role', {
  RoleID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'RoleID'
  },
  RoleName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'RoleName'
  },
  Description: {
    type: DataTypes.TEXT,
    field: 'Description'
  }
}, {
  tableName: 'Role',
  timestamps: false
});

// Instance methods
User.prototype.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.Password);
};

// Thiết lập quan hệ
User.belongsTo(Role, { foreignKey: 'RoleID' });
Role.hasMany(User, { foreignKey: 'RoleID' });

// Static methods
User.findByEmail = async function(email) {
  return await this.findOne({ where: { Email: email } });
};

export { User, Role };
export default User;
