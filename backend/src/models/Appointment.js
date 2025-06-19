import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  // Thông tin người dùng
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID là bắt buộc']
  },
  
  // Thông tin coach
  coach: {
    id: {
      type: String,
      required: [true, 'Coach ID là bắt buộc']
    },
    name: {
      type: String,
      required: [true, 'Tên coach là bắt buộc']
    },
    avatar: String,
    role: String,
    specialty: [String], // Chuyên môn của coach
    experience: String
  },
  
  // Thông tin lịch hẹn
  appointmentDate: {
    type: Date,
    required: [true, 'Ngày hẹn là bắt buộc']
  },
  appointmentTime: {
    type: String,
    required: [true, 'Giờ hẹn là bắt buộc']
  },
  duration: {
    type: Number, // Thời lượng tính bằng phút
    default: 60
  },
  
  // Trạng thái cuộc hẹn
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'],
    default: 'pending'
  },
  
  // Loại cuộc hẹn
  type: {
    type: String,
    enum: ['consultation', 'follow-up', 'emergency', 'group-session'],
    default: 'consultation'
  },
  
  // Ghi chú và lý do
  reason: {
    type: String,
    maxlength: [500, 'Lý do không được vượt quá 500 ký tự']
  },
  notes: {
    type: String,
    maxlength: [1000, 'Ghi chú không được vượt quá 1000 ký tự']
  },
  
  // Thông tin đánh giá (sau khi hoàn thành)
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [500, 'Bình luận không được vượt quá 500 ký tự']
    },
    ratedAt: Date
  },
  
  // Lịch sử thay đổi
  history: [{
    action: {
      type: String,
      enum: ['created', 'confirmed', 'rescheduled', 'cancelled', 'completed']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    reason: String,
    performedBy: {
      type: String,
      enum: ['user', 'coach', 'system']
    }
  }],
  
  // Metadata
  meetingLink: String, // Link cho video call (nếu có)
  cancelledAt: Date,
  cancelledBy: {
    type: String,
    enum: ['user', 'coach', 'system']
  },
  cancellationReason: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
appointmentSchema.index({ user: 1, appointmentDate: 1 });
appointmentSchema.index({ 'coach.id': 1, appointmentDate: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ appointmentDate: 1 });

// Virtual fields
appointmentSchema.virtual('isUpcoming').get(function() {
  return this.appointmentDate > new Date() && this.status !== 'cancelled';
});

appointmentSchema.virtual('isPast').get(function() {
  return this.appointmentDate < new Date();
});

appointmentSchema.virtual('canBeCancelled').get(function() {
  const now = new Date();
  const appointmentTime = new Date(this.appointmentDate);
  const timeDiff = appointmentTime - now;
  const hoursDiff = timeDiff / (1000 * 60 * 60);
  
  return hoursDiff > 24 && ['pending', 'confirmed'].includes(this.status);
});

// Middleware
appointmentSchema.pre('save', function(next) {
  // Thêm vào lịch sử khi có thay đổi status
  if (this.isModified('status') && !this.isNew) {
    this.history.push({
      action: this.status,
      timestamp: new Date(),
      performedBy: 'user' // Có thể customize
    });
  }
  next();
});

// Instance methods
appointmentSchema.methods.cancel = function(reason, cancelledBy = 'user') {
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  this.cancelledBy = cancelledBy;
  this.cancellationReason = reason;
  return this.save();
};

appointmentSchema.methods.confirm = function() {
  this.status = 'confirmed';
  return this.save();
};

appointmentSchema.methods.complete = function() {
  this.status = 'completed';
  return this.save();
};

appointmentSchema.methods.reschedule = function(newDate, newTime) {
  this.appointmentDate = newDate;
  this.appointmentTime = newTime;
  this.status = 'rescheduled';
  return this.save();
};

// Static methods
appointmentSchema.statics.findUserAppointments = function(userId, status = null) {
  const query = { user: userId };
  if (status) query.status = status;
  return this.find(query).sort({ appointmentDate: 1 });
};

appointmentSchema.statics.findCoachAppointments = function(coachId, date = null) {
  const query = { 'coach.id': coachId };
  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    query.appointmentDate = {
      $gte: startOfDay,
      $lte: endOfDay
    };
  }
  return this.find(query).sort({ appointmentDate: 1 });
};

appointmentSchema.statics.findUpcomingAppointments = function(userId) {
  return this.find({
    user: userId,
    appointmentDate: { $gte: new Date() },
    status: { $in: ['pending', 'confirmed'] }
  }).sort({ appointmentDate: 1 });
};

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
