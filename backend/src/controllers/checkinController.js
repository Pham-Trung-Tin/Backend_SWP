import DailyCheckin from '../models/DailyCheckin.js';
import User from '../models/User.js';

// Create or update daily check-in
export const createDailyCheckin = async (req, res) => {
  try {
    const {
      smokingStatus,
      cigarettesSmoked,
      moodLevel,
      cravingLevel,
      stressLevel,
      withdrawalSymptoms,
      alternativeActivities,
      stressFactors,
      notes,
      achievements,
      weight,
      exerciseMinutes,
      sleepHours
    } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if check-in already exists for today
    let checkin = await DailyCheckin.findOne({
      userId: req.user.id,
      date: today
    });

    if (checkin) {
      // Update existing check-in
      Object.assign(checkin, {
        smokingStatus,
        cigarettesSmoked,
        moodLevel,
        cravingLevel,
        stressLevel,
        withdrawalSymptoms,
        alternativeActivities,
        stressFactors,
        notes,
        achievements,
        weight,
        exerciseMinutes,
        sleepHours,
        updatedAt: new Date()
      });
    } else {
      // Create new check-in
      checkin = new DailyCheckin({
        userId: req.user.id,
        date: today,
        smokingStatus,
        cigarettesSmoked,
        moodLevel,
        cravingLevel,
        stressLevel,
        withdrawalSymptoms,
        alternativeActivities,
        stressFactors,
        notes,
        achievements,
        weight,
        exerciseMinutes,
        sleepHours
      });
    }

    await checkin.save();

    // Update user's last check-in date and streak
    const user = await User.findById(req.user.id);
    if (user) {
      user.lastCheckinDate = new Date();
      
      // Calculate streak
      if (smokingStatus === 'smoke-free') {
        user.currentStreak = (user.currentStreak || 0) + 1;
        user.longestStreak = Math.max(user.longestStreak || 0, user.currentStreak);
      } else {
        user.currentStreak = 0;
      }
      
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: 'Daily check-in saved successfully',
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
