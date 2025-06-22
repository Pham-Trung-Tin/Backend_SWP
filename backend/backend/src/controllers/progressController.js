// Controller cho Progress Tracking API
import { pool } from '../middleware/auth.js';

// Lấy tất cả progress tracking
export const getAllProgress = async (req, res) => {
  try {
    const [progress] = await pool.query(`
      SELECT pt.*, p.Title as PlanTitle, u.Name as UserName
      FROM ProgressTracking pt
      JOIN QuitSmokingPlan p ON pt.PlanID = p.PlanID
      JOIN User u ON pt.UserID = u.UserID
      ORDER BY pt.TrackingDate DESC
      LIMIT 50
    `);
    
    res.json({
      success: true,
      count: progress.length,
      data: progress
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách progress:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách progress',
      error: error.message
    });
  }
};

// Lấy progress theo user ID
export const getProgressByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const [progress] = await pool.query(`
      SELECT pt.*, p.Title as PlanTitle
      FROM ProgressTracking pt
      JOIN QuitSmokingPlan p ON pt.PlanID = p.PlanID
      WHERE pt.UserID = ?
      ORDER BY pt.TrackingDate DESC
    `, [userId]);
    
    res.json({
      success: true,
      count: progress.length,
      data: progress
    });
  } catch (error) {
    console.error('Lỗi khi lấy progress theo user:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy progress theo user',
      error: error.message
    });
  }
};

// Tạo progress tracking mới
export const createProgress = async (req, res) => {
  try {
    const {
      planID,
      userID,
      trackingDate,
      cigarettesSmoked,
      moneySaved,
      healthImprovements,
      mood,
      cravings
    } = req.body;

    // Validation
    if (!planID || !userID || !trackingDate || cigarettesSmoked === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin bắt buộc'
      });
    }

    // Kiểm tra plan có tồn tại không
    const [plans] = await pool.query('SELECT * FROM QuitSmokingPlan WHERE PlanID = ?', [planID]);
    if (plans.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Plan không tồn tại'
      });
    }

    // Kiểm tra user có tồn tại không
    const [users] = await pool.query('SELECT * FROM User WHERE UserID = ?', [userID]);
    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User không tồn tại'
      });
    }

    // Tạo progress tracking mới
    const [result] = await pool.query(`
      INSERT INTO ProgressTracking 
      (PlanID, UserID, TrackingDate, CigarettesSmoked, MoneySaved, HealthImprovements, Mood, Cravings, CreatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [planID, userID, trackingDate, cigarettesSmoked, moneySaved || 0, healthImprovements || '', mood || 'neutral', cravings || 0]);

    res.status(201).json({
      success: true,
      message: 'Tạo progress tracking thành công',
      trackingId: result.insertId
    });
  } catch (error) {
    console.error('Lỗi khi tạo progress tracking:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo progress tracking',
      error: error.message
    });
  }
};

// Cập nhật progress tracking
export const updateProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      cigarettesSmoked,
      moneySaved,
      healthImprovements,
      mood,
      cravings
    } = req.body;

    // Kiểm tra progress có tồn tại không
    const [existingProgress] = await pool.query('SELECT * FROM ProgressTracking WHERE TrackingID = ?', [id]);
    if (existingProgress.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Progress tracking không tồn tại'
      });
    }

    // Tạo câu query động
    let query = 'UPDATE ProgressTracking SET ';
    const values = [];
    
    if (cigarettesSmoked !== undefined) {
      query += 'CigarettesSmoked = ?, ';
      values.push(cigarettesSmoked);
    }
    
    if (moneySaved !== undefined) {
      query += 'MoneySaved = ?, ';
      values.push(moneySaved);
    }
    
    if (healthImprovements !== undefined) {
      query += 'HealthImprovements = ?, ';
      values.push(healthImprovements);
    }
    
    if (mood) {
      query += 'Mood = ?, ';
      values.push(mood);
    }
    
    if (cravings !== undefined) {
      query += 'Cravings = ?, ';
      values.push(cravings);
    }
    
    // Loại bỏ dấu phẩy cuối cùng
    query = query.slice(0, -2);
    query += ' WHERE TrackingID = ?';
    values.push(id);

    await pool.query(query, values);

    res.json({
      success: true,
      message: 'Cập nhật progress tracking thành công'
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật progress tracking:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật progress tracking',
      error: error.message
    });
  }
};

// Xóa progress tracking
export const deleteProgress = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra progress có tồn tại không
    const [progress] = await pool.query('SELECT * FROM ProgressTracking WHERE TrackingID = ?', [id]);
    if (progress.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Progress tracking không tồn tại'
      });
    }

    // Xóa progress
    await pool.query('DELETE FROM ProgressTracking WHERE TrackingID = ?', [id]);

    res.json({
      success: true,
      message: 'Xóa progress tracking thành công'
    });
  } catch (error) {
    console.error('Lỗi khi xóa progress tracking:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa progress tracking',
      error: error.message
    });
  }
};
