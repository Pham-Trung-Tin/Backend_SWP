import Appointment from '../models/Appointment.js';
import User from '../models/User.js';

// Get all appointments for a user
export const getUserAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user.id })
      .sort({ date: -1 })
      .populate('userId', 'firstName lastName email');
    
    res.json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Get user appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error.message
    });
  }
};

// Book a new appointment
export const bookAppointment = async (req, res) => {
  try {
    const {
      date,
      time,
      coachId,
      coachName,
      appointmentType,
      notes,
      duration = 60
    } = req.body;

    // Check if user has premium/pro membership for certain appointment types
    const user = await User.findById(req.user.id);
    if (appointmentType === 'one-on-one' && user.membership.type === 'free') {
      return res.status(403).json({
        success: false,
        message: 'One-on-one appointments require premium or pro membership'
      });
    }

    // Check for conflicting appointments
    const existingAppointment = await Appointment.findOne({
      userId: req.user.id,
      date: new Date(date),
      time,
      status: { $in: ['scheduled', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        message: 'You already have an appointment at this time'
      });
    }

    const appointment = new Appointment({
      userId: req.user.id,
      date: new Date(date),
      time,
      coachId,
      coachName,
      appointmentType,
      notes,
      duration,
      status: 'scheduled'
    });

    await appointment.save();

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book appointment',
      error: error.message
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
