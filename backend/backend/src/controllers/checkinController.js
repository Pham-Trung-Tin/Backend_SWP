import DailyCheckin from '../models/DailyCheckin.js';
import User from '../models/User.js';

// @desc    Tạo check-in hàng ngày
// @route   POST /api/checkins
// @access  Private
export const createDailyCheckin = async (req, res) => {
  try {
    const {
      smokingStatus,
      cigarettesSmoked,
      mood,
      cravingLevel,
      withdrawalSymptoms,
      alternativeActivities,
      notes,
      selfRating,
      tomorrowGoal,
      stressLevel,
      stressFactors,
      achievements
    } = req.body;

    const userId = req.user._id;

    // Kiểm tra các trường bắt buộc
    if (!smokingStatus || !mood || !cravingLevel) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc (trạng thái hút thuốc, tâm trạng, mức độ thèm thuốc)'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Kiểm tra đã check-in hôm nay chưa
    let checkin = await DailyCheckin.findOne({
      user: userId,
      date: today
    });

    if (checkin) {
      // Cập nhật check-in hiện có
      Object.assign(checkin, {
        smokingStatus,
        cigarettesSmoked: cigarettesSmoked || 0,
        mood,
        cravingLevel,
        withdrawalSymptoms: withdrawalSymptoms || [],
        alternativeActivities: alternativeActivities || [],
        notes,
        selfRating,
        tomorrowGoal,
        stressLevel,
        stressFactors: stressFactors || [],
        achievements: achievements || []
      });
    } else {      // Tạo check-in mới
      checkin = new DailyCheckin({
        user: userId,
        date: today,
        smokingStatus,
        cigarettesSmoked: cigarettesSmoked || 0,
        mood,
        cravingLevel,
        withdrawalSymptoms: withdrawalSymptoms || [],
        alternativeActivities: alternativeActivities || [],
        notes,
        selfRating,
        tomorrowGoal,
        stressLevel,
        stressFactors: stressFactors || [],
        achievements: achievements || []
      });
    }

    await checkin.save();

    // Cập nhật progress của user
    const user = await User.findById(userId);
    if (user) {
      user.progress.lastCheckinDate = new Date();
      user.progress.totalDaysTracked = (user.progress.totalDaysTracked || 0) + 1;
      
      if (smokingStatus === 'smoke-free') {
        user.progress.currentStreak = (user.progress.currentStreak || 0) + 1;
        if (user.progress.currentStreak > (user.progress.longestStreak || 0)) {
          user.progress.longestStreak = user.progress.currentStreak;
        }
      } else {
        user.progress.currentStreak = 0;
      }
      
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: 'Check-in thành công',
      data: checkin
    });
  } catch (error) {
    console.error('Create daily check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save daily check-in',
      error: error.message
    });
  }
};

// Get user's check-ins
export const getUserCheckins = async (req, res) => {
  try {
    const { page = 1, limit = 30, startDate, endDate } = req.query;
    
    const query = { userId: req.user.id };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const checkins = await DailyCheckin.find(query)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await DailyCheckin.countDocuments(query);

    res.json({
      success: true,
      data: {
        checkins,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get user check-ins error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch check-ins',
      error: error.message
    });
  }
};

// Get today's check-in
export const getTodayCheckin = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkin = await DailyCheckin.findOne({
      userId: req.user.id,
      date: today
    });

    res.json({
      success: true,
      data: checkin
    });
  } catch (error) {
    console.error('Get today check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today\'s check-in',
      error: error.message
    });
  }
};

// Get check-in statistics
export const getCheckinStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Get check-ins for the period
    const checkins = await DailyCheckin.find({
      userId,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    // Calculate statistics
    const stats = {
      totalCheckins: checkins.length,
      smokeFreeeDays: checkins.filter(c => c.smokingStatus === 'smoke-free').length,
      totalCigarettes: checkins.reduce((sum, c) => sum + (c.cigarettesSmoked || 0), 0),
      averageMood: 0,
      averageCraving: 0,
      averageStress: 0,
      commonWithdrawalSymptoms: {},
      commonStressFactors: {},
      totalExerciseMinutes: checkins.reduce((sum, c) => sum + (c.exerciseMinutes || 0), 0),
      averageSleepHours: 0,
      achievements: []
    };

    if (checkins.length > 0) {
      stats.averageMood = checkins.reduce((sum, c) => sum + c.moodLevel, 0) / checkins.length;
      stats.averageCraving = checkins.reduce((sum, c) => sum + c.cravingLevel, 0) / checkins.length;
      stats.averageStress = checkins.reduce((sum, c) => sum + c.stressLevel, 0) / checkins.length;
      
      const sleepData = checkins.filter(c => c.sleepHours > 0);
      if (sleepData.length > 0) {
        stats.averageSleepHours = sleepData.reduce((sum, c) => sum + c.sleepHours, 0) / sleepData.length;
      }

      // Count withdrawal symptoms
      checkins.forEach(checkin => {
        checkin.withdrawalSymptoms?.forEach(symptom => {
          stats.commonWithdrawalSymptoms[symptom] = (stats.commonWithdrawalSymptoms[symptom] || 0) + 1;
        });
      });

      // Count stress factors
      checkins.forEach(checkin => {
        checkin.stressFactors?.forEach(factor => {
          stats.commonStressFactors[factor] = (stats.commonStressFactors[factor] || 0) + 1;
        });
      });

      // Collect all achievements
      checkins.forEach(checkin => {
        checkin.achievements?.forEach(achievement => {
          if (!stats.achievements.includes(achievement)) {
            stats.achievements.push(achievement);
          }
        });
      });
    }

    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    for (let i = checkins.length - 1; i >= 0; i--) {
      if (checkins[i].smokingStatus === 'smoke-free') {
        tempStreak++;
        if (i === checkins.length - 1) {
          currentStreak = tempStreak;
        }
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    stats.currentStreak = currentStreak;
    stats.longestStreak = longestStreak;
    stats.smokeFreeePercentage = checkins.length > 0 ? (stats.smokeFreeeDays / checkins.length) * 100 : 0;

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get check-in stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch check-in statistics',
      error: error.message
    });
  }
};

// Get weekly progress
export const getWeeklyProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get last 7 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const checkins = await DailyCheckin.find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    // Create array for each day of the week
    const weeklyData = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const dayCheckin = checkins.find(c => 
        c.date.toDateString() === currentDate.toDateString()
      );

      weeklyData.push({
        date: currentDate,
        dayName: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
        hasCheckin: !!dayCheckin,
        smokingStatus: dayCheckin?.smokingStatus || null,
        cigarettesSmoked: dayCheckin?.cigarettesSmoked || 0,
        moodLevel: dayCheckin?.moodLevel || 0,
        cravingLevel: dayCheckin?.cravingLevel || 0,
        stressLevel: dayCheckin?.stressLevel || 0
      });
    }

    res.json({
      success: true,
      data: weeklyData
    });
  } catch (error) {
    console.error('Get weekly progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weekly progress',
      error: error.message
    });
  }
};

// Delete check-in
export const deleteCheckin = async (req, res) => {
  try {
    const { id } = req.params;

    const checkin = await DailyCheckin.findOne({
      _id: id,
      userId: req.user.id
    });

    if (!checkin) {
      return res.status(404).json({
        success: false,
        message: 'Check-in not found'
      });
    }

    await DailyCheckin.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Check-in deleted successfully'
    });
  } catch (error) {
    console.error('Delete check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete check-in',
      error: error.message
    });
  }
};
