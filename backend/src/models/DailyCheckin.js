import mongoose from 'mongoose';

const dailyCheckinSchema = new mongoose.Schema({
  // Thông tin người dùng
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID là bắt buộc']
  },
  
  // Ngày check-in
  date: {
    type: Date,
    required: [true, 'Ngày check-in là bắt buộc'],
    default: () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return today;
    }
  },
  
  // Trạng thái hút thuốc
  smokingStatus: {
    type: String,
    enum: ['smoke-free', 'smoked', 'almost-smoked'],
    required: [true, 'Trạng thái hút thuốc là bắt buộc']
  },
  
  // Số điều thuốc đã hút (nếu có)
  cigarettesSmoked: {
    type: Number,
    default: 0,
    min: [0, 'Số điều thuốc không thể âm']
  },
  
  // Tâm trạng
  mood: {
    type: String,
    enum: ['very-bad', 'bad', 'neutral', 'good', 'excellent'],
    required: [true, 'Tâm trạng là bắt buộc']
  },
  
  // Mức độ cảm thấy khó khăn
  cravingLevel: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, 'Mức độ thèm thuốc là bắt buộc']
  },
  
  // Các triệu chứng cai thuốc
  withdrawalSymptoms: [{
    type: String,
    enum: [
      'irritability',      // Cáu gắt
      'anxiety',           // Lo lắng
      'restlessness',      // Bồn chồn
      'difficulty-concentrating', // Khó tập trung
      'sleep-problems',    // Vấn đề về giấc ngủ
      'increased-appetite', // Tăng cảm giác đói
      'depression',        // Trầm cảm
      'fatigue',          // Mệt mỏi
      'headache',         // Đau đầu
      'cough'             // Ho
    ]
  }],
  
  // Các hoạt động thay thế đã thực hiện
  alternativeActivities: [{
    type: String,
    enum: [
      'exercise',          // Tập thể dục
      'meditation',        // Thiền
      'reading',           // Đọc sách
      'music',            // Nghe nhạc
      'walking',          // Đi bộ
      'breathing-exercise', // Thở sâu
      'chewing-gum',      // Nhai kẹo cao su
      'drinking-water',   // Uống nước
      'talking-to-friend', // Nói chuyện với bạn
      'hobby'             // Sở thích khác
    ]
  }],
  
  // Ghi chú cá nhân
  notes: {
    type: String,
    maxlength: [500, 'Ghi chú không được vượt quá 500 ký tự']
  },
  
  // Điểm tự đánh giá (1-10)
  selfRating: {
    type: Number,
    min: 1,
    max: 10
  },
  
  // Mục tiêu cho ngày hôm sau
  tomorrowGoal: {
    type: String,
    maxlength: [200, 'Mục tiêu không được vượt quá 200 ký tự']
  },
  
  // Thông tin về stress
  stressLevel: {
    type: Number,
    min: 1,
    max: 10
  },
  
  stressFactors: [{
    type: String,
    enum: [
      'work',              // Công việc
      'family',            // Gia đình
      'money',             // Tiền bạc
      'health',            // Sức khỏe
      'relationships',     // Mối quan hệ
      'studies',           // Học tập
      'traffic',           // Giao thông
      'weather',           // Thời tiết
      'social-pressure',   // Áp lực xã hội
      'other'              // Khác
    ]
  }],
  
  // Thành tựu trong ngày
  achievements: [{
    type: String,
    maxlength: [100, 'Thành tựu không được vượt quá 100 ký tự']
  }],
  
  // Thời gian check-in
  checkinTime: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
dailyCheckinSchema.index({ user: 1, date: 1 }, { unique: true }); // Mỗi user chỉ có 1 checkin mỗi ngày
dailyCheckinSchema.index({ user: 1, date: -1 }); // Sắp xếp theo ngày gần nhất
dailyCheckinSchema.index({ smokingStatus: 1 });
dailyCheckinSchema.index({ mood: 1 });

// Virtual fields
dailyCheckinSchema.virtual('isSmokeFree').get(function() {
  return this.smokingStatus === 'smoke-free';
});

dailyCheckinSchema.virtual('daysSinceStart').get(function() {
  // Cần populate user để có startDate
  if (this.user && this.user.startDate) {
    const diffTime = Math.abs(this.date - this.user.startDate);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
  return null;
});

// Middleware
dailyCheckinSchema.pre('save', function(next) {
  // Đảm bảo date luôn là đầu ngày (00:00:00)
  if (this.isModified('date')) {
    this.date.setHours(0, 0, 0, 0);
  }
  next();
});

// Instance methods
dailyCheckinSchema.methods.getOverallScore = function() {
  let score = 0;
  
  // Điểm dựa trên trạng thái hút thuốc
  if (this.smokingStatus === 'smoke-free') score += 40;
  else if (this.smokingStatus === 'almost-smoked') score += 20;
  
  // Điểm dựa trên tâm trạng
  const moodScores = {
    'very-bad': 0,
    'bad': 5,
    'neutral': 10,
    'good': 15,
    'excellent': 20
  };
  score += moodScores[this.mood] || 0;
  
  // Điểm dựa trên mức độ thèm thuốc (đảo ngược)
  score += (11 - this.cravingLevel) * 2;
  
  // Điểm dựa trên hoạt động thay thế
  score += this.alternativeActivities.length * 2;
  
  // Điểm dựa trên self rating
  if (this.selfRating) {
    score += this.selfRating * 2;
  }
  
  return Math.min(score, 100); // Tối đa 100 điểm
};

// Static methods
dailyCheckinSchema.statics.getUserCheckins = function(userId, startDate = null, endDate = null) {
  const query = { user: userId };
  
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }
  
  return this.find(query).sort({ date: -1 });
};

dailyCheckinSchema.statics.getStreakData = function(userId) {
  return this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    { $sort: { date: -1 } },
    {
      $group: {
        _id: null,
        checkins: { $push: "$$ROOT" },
        totalDays: { $sum: 1 },
        smokeFreedays: {
          $sum: {
            $cond: [{ $eq: ["$smokingStatus", "smoke-free"] }, 1, 0]
          }
        }
      }
    }
  ]);
};

dailyCheckinSchema.statics.getLastCheckin = function(userId) {
  return this.findOne({ user: userId }).sort({ date: -1 });
};

dailyCheckinSchema.statics.getTodayCheckin = function(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return this.findOne({
    user: userId,
    date: today
  });
};

const DailyCheckin = mongoose.model('DailyCheckin', dailyCheckinSchema);

export default DailyCheckin;
