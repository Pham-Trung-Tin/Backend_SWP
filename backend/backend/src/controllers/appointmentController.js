import Appointment from '../models/Appointment.js';
import User from '../models/User.js';

// @desc    Lấy danh sách cuộc hẹn của user
// @route   GET /api/appointments
// @access  Private
export const getUserAppointments = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const userId = req.user._id;

    // Build query
    const query = { user: userId };
    if (status) query.status = status;

    // Pagination
    const skip = (page - 1) * limit;

    const appointments = await Appointment.find(query)
      .sort({ appointmentDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name email');

    const total = await Appointment.countDocuments(query);

    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get user appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách cuộc hẹn'
    });
  }
};

// @desc    Tạo cuộc hẹn mới  
// @route   POST /api/appointments
// @access  Private
export const createAppointment = async (req, res) => {
  try {
    const {
      coachId,
      coachName,
      appointmentDate,
      appointmentTime,
      type,
      reason,
      duration
    } = req.body;

    const userId = req.user._id;

    // Kiểm tra các trường bắt buộc
    if (!coachId || !coachName || !appointmentDate || !appointmentTime) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin cuộc hẹn'
      });
    }

    // Kiểm tra ngày hẹn không được trong quá khứ
    const appointmentDateTime = new Date(appointmentDate);
    if (appointmentDateTime < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Ngày hẹn không thể trong quá khứ'
      });
    }

    // Kiểm tra user có premium/pro membership cho một số loại appointment
    if (type === 'one-on-one' && req.user.membership === 'free') {
      return res.status(403).json({
        success: false,
        message: 'Tư vấn 1-1 yêu cầu gói thành viên premium hoặc pro'
      });
    }

    // Kiểm tra trùng lịch
    const existingAppointment = await Appointment.findOne({
      user: userId,
      appointmentDate: appointmentDateTime,
      appointmentTime,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        message: 'Bạn đã có lịch hẹn vào thời gian này'
      });
    }

    // Tạo cuộc hẹn mới
    const appointment = new Appointment({
      user: userId,
      coach: {
        id: coachId,
        name: coachName
      },
      appointmentDate: appointmentDateTime,
      appointmentTime,
      type: type || 'consultation',
      reason,
      duration: duration || 60,
      status: 'pending'
    });

    await appointment.save();

    res.status(201).json({
      success: true,
      message: 'Đặt lịch hẹn thành công',
      data: { appointment }
    });

  } catch (error) {
    console.error('Create appointment error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo cuộc hẹn'
    });
  }
};

// Update appointment
export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const appointment = await Appointment.findOne({
      _id: id,
      userId: req.user.id
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Only allow certain updates based on appointment status
    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update completed appointment'
      });
    }

    Object.assign(appointment, updates);
    appointment.updatedAt = new Date();
    
    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment',
      error: error.message
    });
  }
};

// Cancel appointment
export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const appointment = await Appointment.findOne({
      _id: id,
      userId: req.user.id
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (appointment.status === 'cancelled' || appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel ${appointment.status} appointment`
      });
    }

    appointment.status = 'cancelled';
    appointment.cancellationReason = reason;
    appointment.updatedAt = new Date();
    
    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel appointment',
      error: error.message
    });
  }
};

// Rate appointment
export const rateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, feedback } = req.body;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const appointment = await Appointment.findOne({
      _id: id,
      userId: req.user.id,
      status: 'completed'
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Completed appointment not found'
      });
    }

    appointment.rating = {
      score: rating,
      feedback,
      ratedAt: new Date()
    };
    
    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment rated successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Rate appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to rate appointment',
      error: error.message
    });
  }
};

// Get available time slots
export const getAvailableSlots = async (req, res) => {
  try {
    const { date, coachId } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book appointments in the past'
      });
    }

    // Find existing appointments for the date
    const existingAppointments = await Appointment.find({
      date: selectedDate,
      ...(coachId && { coachId }),
      status: { $in: ['scheduled', 'confirmed'] }
    }).select('time');

    const bookedTimes = existingAppointments.map(apt => apt.time);

    // Generate available time slots (9 AM to 5 PM, 1-hour slots)
    const availableSlots = [];
    for (let hour = 9; hour < 17; hour++) {
      const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
      if (!bookedTimes.includes(timeSlot)) {
        availableSlots.push(timeSlot);
      }
    }

    res.json({
      success: true,
      data: {
        date: selectedDate,
        availableSlots,
        bookedSlots: bookedTimes
      }
    });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available slots',
      error: error.message
    });
  }
};

// Get appointment statistics
export const getAppointmentStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Appointment.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalAppointments = await Appointment.countDocuments({ userId });
    const upcomingAppointments = await Appointment.countDocuments({
      userId,
      date: { $gte: new Date() },
      status: { $in: ['scheduled', 'confirmed'] }
    });

    const averageRating = await Appointment.aggregate([
      { 
        $match: { 
          userId: userId,
          'rating.score': { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating.score' }
        }
      }
    ]);

    const formattedStats = {
      total: totalAppointments,
      upcoming: upcomingAppointments,
      byStatus: stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      averageRating: averageRating[0]?.avgRating || 0
    };

    res.json({
      success: true,
      data: formattedStats
    });
  } catch (error) {
    console.error('Get appointment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointment statistics',
      error: error.message
    });
  }
};
