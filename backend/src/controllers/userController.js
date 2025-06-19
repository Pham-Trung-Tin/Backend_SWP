import User from '../models/User.js';
import DailyCheckin from '../models/DailyCheckin.js';
import Appointment from '../models/Appointment.js';

// Get user profile with progress data
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate days since quit date
    const daysSinceQuit = user.quitPlan?.quitDate 
      ? Math.floor((new Date() - new Date(user.quitPlan.quitDate)) / (1000 * 60 * 60 * 24))
      : 0;

    // Get recent check-ins count
    const recentCheckins = await DailyCheckin.countDocuments({
      userId: req.user.id,
      date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    // Get total appointments
    const totalAppointments = await Appointment.countDocuments({
      userId: req.user.id
    });

    const profileData = {
      ...user.toObject(),
      stats: {
        daysSinceQuit,
        recentCheckins,
        totalAppointments,
        currentStreak: user.currentStreak || 0,
        longestStreak: user.longestStreak || 0
      }
    };

    res.json({
      success: true,
      data: profileData
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: error.message
    });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      dateOfBirth,
      smokingHistory,
      quitPlan,
      preferences,
      emergencyContact
    } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update allowed fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (dateOfBirth) user.dateOfBirth = new Date(dateOfBirth);
    if (smokingHistory) user.smokingHistory = { ...user.smokingHistory, ...smokingHistory };
    if (quitPlan) user.quitPlan = { ...user.quitPlan, ...quitPlan };
    if (preferences) user.preferences = { ...user.preferences, ...preferences };
    if (emergencyContact) user.emergencyContact = { ...user.emergencyContact, ...emergencyContact };

    user.updatedAt = new Date();
    
    await user.save();

    const updatedUser = await User.findById(req.user.id).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Get user progress dashboard
export const getProgressDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');

    // Calculate money saved
    const calculateMoneySaved = () => {
      if (!user.quitPlan?.quitDate || !user.smokingHistory?.averageCigarettesPerDay || !user.smokingHistory?.costPerPack) {
        return 0;
      }

      const daysSinceQuit = Math.floor((new Date() - new Date(user.quitPlan.quitDate)) / (1000 * 60 * 60 * 24));
      const cigarettesNotSmoked = daysSinceQuit * user.smokingHistory.averageCigarettesPerDay;
      const packsNotSmoked = cigarettesNotSmoked / (user.smokingHistory.cigarettesPerPack || 20);
      
      return Math.max(0, packsNotSmoked * user.smokingHistory.costPerPack);
    };

    // Calculate health improvements
    const calculateHealthImprovements = () => {
      if (!user.quitPlan?.quitDate) return [];

      const daysSinceQuit = Math.floor((new Date() - new Date(user.quitPlan.quitDate)) / (1000 * 60 * 60 * 24));
      const improvements = [];

      if (daysSinceQuit >= 1) {
        improvements.push({
          milestone: '24 hours',
          achievement: 'Heart attack risk begins to decrease',
          achieved: true,
          date: new Date(user.quitPlan.quitDate.getTime() + 24 * 60 * 60 * 1000)
        });
      }

      if (daysSinceQuit >= 7) {
        improvements.push({
          milestone: '1 week',
          achievement: 'Sense of taste and smell improve',
          achieved: true,
          date: new Date(user.quitPlan.quitDate.getTime() + 7 * 24 * 60 * 60 * 1000)
        });
      }

      if (daysSinceQuit >= 30) {
        improvements.push({
          milestone: '1 month',
          achievement: 'Lung function begins to improve',
          achieved: true,
          date: new Date(user.quitPlan.quitDate.getTime() + 30 * 24 * 60 * 60 * 1000)
        });
      }

      if (daysSinceQuit >= 365) {
        improvements.push({
          milestone: '1 year',
          achievement: 'Risk of heart disease is cut in half',
          achieved: true,
          date: new Date(user.quitPlan.quitDate.getTime() + 365 * 24 * 60 * 60 * 1000)
        });
      }

      // Add future milestones
      if (daysSinceQuit < 30) {
        improvements.push({
          milestone: '1 month',
          achievement: 'Lung function begins to improve',
          achieved: false,
          date: new Date(user.quitPlan.quitDate.getTime() + 30 * 24 * 60 * 60 * 1000)
        });
      }

      if (daysSinceQuit < 365) {
        improvements.push({
          milestone: '1 year',
          achievement: 'Risk of heart disease is cut in half',
          achieved: false,
          date: new Date(user.quitPlan.quitDate.getTime() + 365 * 24 * 60 * 60 * 1000)
        });
      }

      return improvements;
    };

    // Get recent check-ins for mood/craving trends
    const recentCheckins = await DailyCheckin.find({
      userId,
      date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }).sort({ date: -1 }).limit(30);

    // Calculate trends
    const calculateTrend = (data, field) => {
      if (data.length < 2) return 0;
      const recent = data.slice(0, Math.ceil(data.length / 2));
      const older = data.slice(Math.ceil(data.length / 2));
      
      const recentAvg = recent.reduce((sum, item) => sum + item[field], 0) / recent.length;
      const olderAvg = older.reduce((sum, item) => sum + item[field], 0) / older.length;
      
      return recentAvg - olderAvg;
    };

    const moodTrend = calculateTrend(recentCheckins, 'moodLevel');
    const cravingTrend = calculateTrend(recentCheckins, 'cravingLevel');

    // Get upcoming appointments
    const upcomingAppointments = await Appointment.find({
      userId,
      date: { $gte: new Date() },
      status: { $in: ['scheduled', 'confirmed'] }
    }).sort({ date: 1 }).limit(3);

    const dashboardData = {
      user: {
        name: `${user.firstName} ${user.lastName}`,
        membershipType: user.membership.type,
        quitDate: user.quitPlan?.quitDate,
        currentStreak: user.currentStreak || 0,
        longestStreak: user.longestStreak || 0
      },
      financial: {
        moneySaved: calculateMoneySaved(),
        currency: user.preferences?.currency || 'USD'
      },
      health: {
        improvements: calculateHealthImprovements(),
        daysSinceQuit: user.quitPlan?.quitDate 
          ? Math.floor((new Date() - new Date(user.quitPlan.quitDate)) / (1000 * 60 * 60 * 24))
          : 0
      },
      trends: {
        mood: {
          trend: moodTrend > 0 ? 'improving' : moodTrend < 0 ? 'declining' : 'stable',
          value: moodTrend
        },
        craving: {
          trend: cravingTrend < 0 ? 'improving' : cravingTrend > 0 ? 'worsening' : 'stable',
          value: cravingTrend
        }
      },
      recentActivity: {
        checkinCount: recentCheckins.length,
        upcomingAppointments: upcomingAppointments.length,
        lastCheckin: recentCheckins[0]?.date || null
      }
    };

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Get progress dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch progress dashboard',
      error: error.message
    });
  }
};

// Update quit plan
export const updateQuitPlan = async (req, res) => {
  try {
    const {
      quitDate,
      reason,
      triggers,
      copingStrategies,
      supportSystem,
      goals
    } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.quitPlan = {
      ...user.quitPlan,
      quitDate: quitDate ? new Date(quitDate) : user.quitPlan?.quitDate,
      reason: reason || user.quitPlan?.reason,
      triggers: triggers || user.quitPlan?.triggers,
      copingStrategies: copingStrategies || user.quitPlan?.copingStrategies,
      supportSystem: supportSystem || user.quitPlan?.supportSystem,
      goals: goals || user.quitPlan?.goals,
      updatedAt: new Date()
    };

    await user.save();

    res.json({
      success: true,
      message: 'Quit plan updated successfully',
      data: user.quitPlan
    });
  } catch (error) {
    console.error('Update quit plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update quit plan',
      error: error.message
    });
  }
};

// Get user achievements
export const getUserAchievements = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Define achievement criteria
    const achievements = [
      {
        id: 'first_day',
        title: 'First Day Smoke-Free',
        description: 'Completed your first day without smoking',
        icon: '🌟',
        type: 'streak',
        requirement: 1,
        achieved: (user.longestStreak || 0) >= 1
      },
      {
        id: 'one_week',
        title: 'One Week Strong',
        description: 'Maintained a 7-day smoke-free streak',
        icon: '💪',
        type: 'streak',
        requirement: 7,
        achieved: (user.longestStreak || 0) >= 7
      },
      {
        id: 'one_month',
        title: 'Monthly Milestone',
        description: 'Completed 30 days smoke-free',
        icon: '🏆',
        type: 'streak',
        requirement: 30,
        achieved: (user.longestStreak || 0) >= 30
      },
      {
        id: 'three_months',
        title: 'Quarter Champion',
        description: 'Achieved 90 days smoke-free',
        icon: '👑',
        type: 'streak',
        requirement: 90,
        achieved: (user.longestStreak || 0) >= 90
      },
      {
        id: 'six_months',
        title: 'Half-Year Hero',
        description: 'Reached 180 days smoke-free',
        icon: '🎖️',
        type: 'streak',
        requirement: 180,
        achieved: (user.longestStreak || 0) >= 180
      },
      {
        id: 'one_year',
        title: 'Annual Achievement',
        description: 'Completed one full year smoke-free',
        icon: '🥇',
        type: 'streak',
        requirement: 365,
        achieved: (user.longestStreak || 0) >= 365
      }
    ];

    // Get check-in based achievements
    const checkinCount = await DailyCheckin.countDocuments({ userId });
    const checkinAchievements = [
      {
        id: 'first_checkin',
        title: 'Getting Started',
        description: 'Completed your first daily check-in',
        icon: '📝',
        type: 'checkin',
        requirement: 1,
        achieved: checkinCount >= 1
      },
      {
        id: 'week_checkins',
        title: 'Consistent Logger',
        description: 'Completed 7 daily check-ins',
        icon: '📊',
        type: 'checkin',
        requirement: 7,
        achieved: checkinCount >= 7
      },
      {
        id: 'month_checkins',
        title: 'Dedicated Tracker',
        description: 'Completed 30 daily check-ins',
        icon: '📈',
        type: 'checkin',
        requirement: 30,
        achieved: checkinCount >= 30
      }
    ];

    // Get appointment based achievements
    const appointmentCount = await Appointment.countDocuments({ 
      userId,
      status: 'completed'
    });

    const appointmentAchievements = [
      {
        id: 'first_appointment',
        title: 'Support Seeker',
        description: 'Attended your first coaching session',
        icon: '🤝',
        type: 'appointment',
        requirement: 1,
        achieved: appointmentCount >= 1
      },
      {
        id: 'five_appointments',
        title: 'Committed Client',
        description: 'Completed 5 coaching sessions',
        icon: '💼',
        type: 'appointment',
        requirement: 5,
        achieved: appointmentCount >= 5
      }
    ];

    const allAchievements = [
      ...achievements,
      ...checkinAchievements,
      ...appointmentAchievements
    ];

    const earnedAchievements = allAchievements.filter(a => a.achieved);
    const availableAchievements = allAchievements.filter(a => !a.achieved);

    res.json({
      success: true,
      data: {
        earned: earnedAchievements,
        available: availableAchievements,
        total: allAchievements.length,
        earnedCount: earnedAchievements.length
      }
    });
  } catch (error) {
    console.error('Get user achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch achievements',
      error: error.message
    });
  }
};
