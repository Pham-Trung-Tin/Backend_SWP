import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // Thông tin cơ bản
  name: {
    type: String,
    required: [true, 'Tên là bắt buộc'],
    trim: true,
    maxlength: [50, 'Tên không được vượt quá 50 ký tự']
  },
  email: {
    type: String,
    required: [true, 'Email là bắt buộc'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ']
  },
  password: {
    type: String,
    required: [true, 'Mật khẩu là bắt buộc'],
    minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự']
  },
  
  // Thông tin về thuốc lá
  cigarettesPerDay: {
    type: Number,
    required: [true, 'Số điều thuốc mỗi ngày là bắt buộc'],
    min: [1, 'Số điều thuốc phải lớn hơn 0'],
    max: [200, 'Số điều thuốc không thể vượt quá 200']
  },
  costPerPack: {
    type: Number,
    required: [true, 'Giá tiền mỗi gói thuốc là bắt buộc'],
    min: [1000, 'Giá tiền phải lớn hơn 1000 VNĐ']
  },
  cigarettesPerPack: {
    type: Number,
    required: [true, 'Số điều thuốc mỗi gói là bắt buộc'],
    default: 20,
    min: [1, 'Số điều thuốc mỗi gói phải lớn hơn 0']
  },
  
  // Thông tin về quá trình bỏ thuốc
  startDate: {
    type: Date,
    required: [true, 'Ngày bắt đầu bỏ thuốc là bắt buộc'],
    default: Date.now
  },
  daysWithoutSmoking: {
    type: Number,
    default: 0,
    min: [0, 'Số ngày không hút thuốc không thể âm']
  },
  
  // Thông tin thành viên
  membership: {
    type: String,
    enum: ['free', 'premium', 'pro'],
    default: 'free'
  },
  membershipExpiry: {
    type: Date,
    default: null
  },
  
  // Kế hoạch bỏ thuốc
  quitPlan: {
    strategy: String,
    targetDate: Date,
    milestones: [{
      day: Number,
      description: String,
      completed: { type: Boolean, default: false },
      completedDate: Date
    }],
    notes: String
  },
  
  // Thông tin tiến trình
  progress: {
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    totalDaysTracked: { type: Number, default: 0 },
    lastCheckinDate: Date
  },
  
  // Cài đặt cá nhân
  settings: {
    notifications: { type: Boolean, default: true },
    reminders: { type: Boolean, default: true },
    publicProfile: { type: Boolean, default: false },
    timezone: { type: String, default: 'Asia/Ho_Chi_Minh' }
  },
  
  // Metadata
  lastLogin: Date,
  isActive: { type: Boolean, default: true },
  avatar: String
}, {
  timestamps: true, // Tự động thêm createdAt và updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes để tối ưu hóa queries
userSchema.index({ email: 1 });
userSchema.index({ membership: 1 });
userSchema.index({ startDate: 1 });

// Virtual fields
userSchema.virtual('moneySaved').get(function() {
  const dailyCost = (this.costPerPack / this.cigarettesPerPack) * this.cigarettesPerDay;
  return Math.round(dailyCost * this.daysWithoutSmoking);
});

userSchema.virtual('cigarettesNotSmoked').get(function() {
  return this.cigarettesPerDay * this.daysWithoutSmoking;
});

// Middleware để hash password trước khi lưu
userSchema.pre('save', async function(next) {
  // Chỉ hash password nếu nó đã được modify
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password với salt rounds = 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Middleware để cập nhật lastLogin
userSchema.pre('save', function(next) {
  if (this.isModified('lastLogin') && this.lastLogin) {
    // Cập nhật số ngày không hút thuốc dựa trên startDate
    const now = new Date();
    const diffTime = Math.abs(now - this.startDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    this.daysWithoutSmoking = diffDays;
  }
  next();
});

// Instance methods
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.updateLoginInfo = function() {
  this.lastLogin = new Date();
  return this.save();
};

userSchema.methods.hasActiveMembership = function() {
  if (this.membership === 'free') return true;
  if (!this.membershipExpiry) return false;
  return this.membershipExpiry > new Date();
};

// Static methods
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true });
};

// Đảm bảo không trả về password khi convert sang JSON
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

const User = mongoose.model('User', userSchema);

export default User;
