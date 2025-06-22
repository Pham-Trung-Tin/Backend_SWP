// Controller cho Plans API
import { pool } from '../middleware/auth.js';

// Lấy tất cả plans
export const getAllPlans = async (req, res) => {
  try {
    const [plans] = await pool.query(`
      SELECT p.*, u.Name as UserName
      FROM QuitSmokingPlan p
      JOIN User u ON p.UserID = u.UserID
      ORDER BY p.CreatedAt DESC
    `);
    
    res.json({
      success: true,
      count: plans.length,
      data: plans
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách plans:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách plans',
      error: error.message
    });
  }
};

// Lấy plan theo ID
export const getPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [plans] = await pool.query(`
      SELECT p.*, u.Name as UserName
      FROM QuitSmokingPlan p
      JOIN User u ON p.UserID = u.UserID
      WHERE p.PlanID = ?
    `, [id]);
    
    if (plans.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Plan không tồn tại'
      });
    }
    
    res.json({
      success: true,
      data: plans[0]
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin plan:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin plan',
      error: error.message
    });
  }
};

// Tạo plan mới
export const createPlan = async (req, res) => {
  try {
    const {
      userID,
      title,
      startDate,
      targetDate,
      cigarettesPerDay,
      costPerPack,
      cigarettesPerPack = 20
    } = req.body;

    // Validation
    if (!userID || !title || !startDate || !targetDate || !cigarettesPerDay || !costPerPack) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin bắt buộc'
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

    // Tạo plan mới
    const [result] = await pool.query(`
      INSERT INTO QuitSmokingPlan 
      (UserID, Title, StartDate, TargetDate, CigarettesPerDay, CostPerPack, CigarettesPerPack, Status, CreatedAt, UpdatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
    `, [userID, title, startDate, targetDate, cigarettesPerDay, costPerPack, cigarettesPerPack]);

    res.status(201).json({
      success: true,
      message: 'Tạo plan thành công',
      planId: result.insertId
    });
  } catch (error) {
    console.error('Lỗi khi tạo plan:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo plan',
      error: error.message
    });
  }
};

// Cập nhật plan
export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      startDate,
      targetDate,
      cigarettesPerDay,
      costPerPack,
      cigarettesPerPack,
      status
    } = req.body;

    // Kiểm tra plan có tồn tại không
    const [existingPlans] = await pool.query('SELECT * FROM QuitSmokingPlan WHERE PlanID = ?', [id]);
    if (existingPlans.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Plan không tồn tại'
      });
    }

    // Tạo câu query động
    let query = 'UPDATE QuitSmokingPlan SET ';
    const values = [];
    
    if (title) {
      query += 'Title = ?, ';
      values.push(title);
    }
    
    if (startDate) {
      query += 'StartDate = ?, ';
      values.push(startDate);
    }
    
    if (targetDate) {
      query += 'TargetDate = ?, ';
      values.push(targetDate);
    }
    
    if (cigarettesPerDay) {
      query += 'CigarettesPerDay = ?, ';
      values.push(cigarettesPerDay);
    }
    
    if (costPerPack) {
      query += 'CostPerPack = ?, ';
      values.push(costPerPack);
    }
    
    if (cigarettesPerPack) {
      query += 'CigarettesPerPack = ?, ';
      values.push(cigarettesPerPack);
    }
    
    if (status) {
      query += 'Status = ?, ';
      values.push(status);
    }
    
    query += 'UpdatedAt = NOW() WHERE PlanID = ?';
    values.push(id);

    await pool.query(query, values);

    res.json({
      success: true,
      message: 'Cập nhật plan thành công'
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật plan:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật plan',
      error: error.message
    });
  }
};

// Xóa plan
export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra plan có tồn tại không
    const [plans] = await pool.query('SELECT * FROM QuitSmokingPlan WHERE PlanID = ?', [id]);
    if (plans.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Plan không tồn tại'
      });
    }

    // Xóa plan
    await pool.query('DELETE FROM QuitSmokingPlan WHERE PlanID = ?', [id]);

    res.json({
      success: true,
      message: 'Xóa plan thành công'
    });
  } catch (error) {
    console.error('Lỗi khi xóa plan:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa plan',
      error: error.message
    });
  }
};
