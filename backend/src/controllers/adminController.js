import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import DailyCheckin from '../models/DailyCheckin.js';

// Get platform statistics
export const getPlatformStats = async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({
      lastCheckinDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });
    const premiumUsers = await User.countDocuments({
      'membership.type': { $in: ['premium', 'pro'] },
      'membership.status': 'active'
    });

    // Membership breakdown
    const membershipStats = await User.aggregate([
      {
        $group: {
          _id: '$membership.type',
          count: { $sum: 1 }
        }
      }
    ]);

    // Appointment statistics
    const totalAppointments = await Appointment.countDocuments();
    const upcomingAppointments = await Appointment.countDocuments({
      date: { $gte: new Date() },
      status: { $in: ['scheduled', 'confirmed'] }
    });
    const completedAppointments = await Appointment.countDocuments({
      status: 'completed'
    });

    // Check-in statistics
    const totalCheckins = await DailyCheckin.countDocuments();
    const todayCheckins = await DailyCheckin.countDocuments({
      date: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });

    // Recent registrations (last 30 days)
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    // Success rate calculation
    const smokeFreeCheckins = await DailyCheckin.countDocuments({
      smokingStatus: 'smoke-free'
    });
    const successRate = totalCheckins > 0 ? (smokeFreeCheckins / totalCheckins) * 100 : 0;

    const stats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        premium: premiumUsers,
        recentRegistrations,
        membershipBreakdown: membershipStats.reduce((acc, stat) => {
          acc[stat._id || 'free'] = stat.count;
          return acc;
        }, {})
      },
      appointments: {
        total: totalAppointments,
        upcoming: upcomingAppointments,
        completed: completedAppointments
      },
      checkins: {
        total: totalCheckins,
        today: todayCheckins,
        smokeFree: smokeFreeCheckins,
        successRate: Math.round(successRate * 100) / 100
      },
      engagement: {
        activeUserRate: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0,
        avgCheckinsPerUser: totalUsers > 0 ? Math.round(totalCheckins / totalUsers) : 0
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get platform stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch platform statistics',
      error: error.message
    });
  }
};

// Get all users with pagination
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, membershipType, status } = req.query;

    const query = {};
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (membershipType) {
      query['membership.type'] = membershipType;
    }

    if (status === 'active') {
      query.lastCheckinDate = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
    } else if (status === 'inactive') {
      query.$or = [
        { lastCheckinDate: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        { lastCheckinDate: { $exists: false } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

// Get user details by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's recent activity
    const recentCheckins = await DailyCheckin.find({ userId: id })
      .sort({ date: -1 })
      .limit(10);

    const recentAppointments = await Appointment.find({ userId: id })
      .sort({ date: -1 })
      .limit(5);

    const userDetails = {
      ...user.toObject(),
      recentActivity: {
        checkins: recentCheckins,
        appointments: recentAppointments
      }
    };

    res.json({
      success: true,
      data: userDetails
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user details',
      error: error.message
    });
  }
};

// Update user membership (admin only)
export const updateUserMembership = async (req, res) => {
  try {
    const { id } = req.params;
    const { membershipType, duration = 1 } = req.body;

    if (!['free', 'premium', 'pro'].includes(membershipType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid membership type'
      });
    }

    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (membershipType === 'free') {
      user.membership = {
        type: 'free',
        status: 'active',
        startDate: new Date(),
        expiresAt: null
      };
    } else {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + duration);

      user.membership = {
        type: membershipType,
        status: 'active',
        startDate: new Date(),
        expiresAt,
        paymentHistory: user.membership.paymentHistory || []
      };
    }

    await user.save();

    res.json({
      success: true,
      message: `User membership updated to ${membershipType}`,
      data: {
        userId: user._id,
        membership: user.membership
      }
    });
  } catch (error) {
    console.error('Update user membership error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user membership',
      error: error.message
    });
  }
};

// Deactivate user account
export const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = false;
    user.deactivationReason = reason;
    user.deactivationDate = new Date();

    await user.save();

    res.json({
      success: true,
      message: 'User account deactivated successfully',
      data: {
        userId: user._id,
        isActive: user.isActive,
        deactivationDate: user.deactivationDate
      }
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate user',
      error: error.message
    });
  }
};

// Get recent activity across platform
export const getRecentActivity = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    // Get recent user registrations
    const recentUsers = await User.find()
      .select('firstName lastName email createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get recent appointments
    const recentAppointments = await Appointment.find()
      .populate('userId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get recent check-ins
    const recentCheckins = await DailyCheckin.find()
      .populate('userId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(10);

    // Combine and sort all activities
    const activities = [
      ...recentUsers.map(user => ({
        type: 'user_registration',
        timestamp: user.createdAt,
        data: {
          userId: user._id,
          userName: `${user.firstName} ${user.lastName}`,
          email: user.email
        }
      })),
      ...recentAppointments.map(apt => ({
        type: 'appointment_booked',
        timestamp: apt.createdAt,
        data: {
          appointmentId: apt._id,
          userName: apt.userId ? `${apt.userId.firstName} ${apt.userId.lastName}` : 'Unknown',
          appointmentType: apt.appointmentType,
          date: apt.date
        }
      })),
      ...recentCheckins.map(checkin => ({
        type: 'daily_checkin',
        timestamp: checkin.createdAt,
        data: {
          checkinId: checkin._id,
          userName: checkin.userId ? `${checkin.userId.firstName} ${checkin.userId.lastName}` : 'Unknown',
          smokingStatus: checkin.smokingStatus,
          date: checkin.date
        }
      }))
    ]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activity',
      error: error.message
    });
  }
};
