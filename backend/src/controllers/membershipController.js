import User from '../models/User.js';

// @desc    Lấy thông tin membership
// @route   GET /api/membership
// @access  Private
export const getMembershipInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('membership membershipExpiry');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User không tồn tại'
      });
    }

    // Tính số ngày còn lại
    const daysRemaining = user.membershipExpiry 
      ? Math.max(0, Math.ceil((user.membershipExpiry - new Date()) / (1000 * 60 * 60 * 24)))
      : null;

    const membershipInfo = {
      type: user.membership,
      isActive: user.hasActiveMembership(),
      expiryDate: user.membershipExpiry,
      daysRemaining,
      features: getMembershipFeatures(user.membership),
      canUpgrade: user.membership !== 'pro'
    };

    res.json({
      success: true,
      data: membershipInfo
    });
  } catch (error) {
    console.error('Get membership info error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin membership'
    });
  }
};

// Upgrade membership
export const upgradeMembership = async (req, res) => {
  try {
    const { membershipType, duration = 1 } = req.body;

    if (!['premium', 'pro'].includes(membershipType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid membership type'
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate expiry date
    const startDate = new Date();
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + duration);

    // Update membership
    user.membership = {
      type: membershipType,
      status: 'active',
      startDate,
      expiresAt,
      paymentHistory: [
        ...(user.membership.paymentHistory || []),
        {
          amount: getMembershipPrice(membershipType, duration),
          currency: 'USD',
          type: membershipType,
          duration,
          date: new Date(),
          status: 'completed'
        }
      ]
    };

    await user.save();

    res.json({
      success: true,
      message: `Successfully upgraded to ${membershipType} membership`,
      data: {
        type: user.membership.type,
        status: user.membership.status,
        expiresAt: user.membership.expiresAt,
        features: getMembershipFeatures(membershipType)
      }
    });
  } catch (error) {
    console.error('Upgrade membership error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upgrade membership',
      error: error.message
    });
  }
};

// Cancel membership
export const cancelMembership = async (req, res) => {
  try {
    const { reason } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.membership.type === 'free') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel free membership'
      });
    }

    // Set to cancel at period end
    user.membership.status = 'cancelled';
    user.membership.cancellationReason = reason;
    user.membership.cancellationDate = new Date();

    await user.save();

    res.json({
      success: true,
      message: 'Membership cancellation scheduled',
      data: {
        status: user.membership.status,
        expiresAt: user.membership.expiresAt,
        message: 'You will retain access until your current billing period ends'
      }
    });
  } catch (error) {
    console.error('Cancel membership error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel membership',
      error: error.message
    });
  }
};

// Get membership plans
export const getMembershipPlans = async (req, res) => {
  try {
    const plans = [
      {
        type: 'free',
        name: 'Free',
        price: 0,
        duration: 'lifetime',
        features: getMembershipFeatures('free'),
        recommended: false
      },
      {
        type: 'premium',
        name: 'Premium',
        price: 9.99,
        duration: 'month',
        features: getMembershipFeatures('premium'),
        recommended: true
      },
      {
        type: 'pro',
        name: 'Pro',
        price: 19.99,
        duration: 'month',
        features: getMembershipFeatures('pro'),
        recommended: false
      }
    ];

    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('Get membership plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch membership plans',
      error: error.message
    });
  }
};

// Get payment history
export const getPaymentHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('membership.paymentHistory');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const paymentHistory = user.membership?.paymentHistory || [];

    res.json({
      success: true,
      data: paymentHistory.sort((a, b) => new Date(b.date) - new Date(a.date))
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history',
      error: error.message
    });
  }
};

// Helper functions
const getMembershipFeatures = (type) => {
  const features = {
    free: [
      'Basic progress tracking',
      'Daily check-ins',
      'Community support',
      'Educational articles'
    ],
    premium: [
      'All free features',
      'Advanced progress analytics',
      'Personalized quit plan',
      'Group coaching sessions',
      'Priority email support',
      'Mobile app access'
    ],
    pro: [
      'All premium features',
      'One-on-one coaching sessions',
      '24/7 priority support',
      'Custom meal and exercise plans',
      'Advanced health tracking',
      'Expert webinars',
      'Unlimited coach consultations'
    ]
  };

  return features[type] || features.free;
};

const getMembershipPrice = (type, duration) => {
  const prices = {
    premium: 9.99,
    pro: 19.99
  };

  return (prices[type] || 0) * duration;
};
