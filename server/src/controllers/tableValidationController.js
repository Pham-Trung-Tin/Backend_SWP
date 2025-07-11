import { pool } from '../config/database.js';
import { sendError, sendSuccess } from '../utils/response.js';

// GET /api/health/validate-table - Kiểm tra cấu trúc bảng daily_progress
export const validateProgressTable = async (req, res) => {
  try {
    // Kiểm tra quyền truy cập
    if (!req.user || !req.user.id) {
      return sendError(res, 'Không có quyền truy cập, vui lòng đăng nhập', 401);
    }

    // Lấy thông tin cấu trúc bảng daily_progress
    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'daily_progress'
    `);

    // Danh sách các cột cần thiết cho tính năng theo dõi sức khỏe
    const requiredColumns = [
      'smoker_id',
      'date',
      'target_cigarettes',
      'actual_cigarettes',
      'cigarettes_avoided',
      'money_saved',
      'health_score',
      'streak_days',
      'notes'
    ];

    // Kiểm tra các cột hiện có
    const existingColumns = columns.map(col => col.COLUMN_NAME.toLowerCase());
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col.toLowerCase()));

    // Tạo các cột còn thiếu nếu có
    if (missingColumns.length > 0) {
      console.log(`Phát hiện ${missingColumns.length} cột thiếu trong bảng daily_progress:`, missingColumns);

      // Tạo câu lệnh ALTER TABLE để thêm các cột còn thiếu
      for (const column of missingColumns) {
        let dataType = '';
        let defaultValue = '';

        switch (column) {
          case 'target_cigarettes':
          case 'actual_cigarettes':
          case 'cigarettes_avoided':
          case 'streak_days':
          case 'health_score':
            dataType = 'INT';
            defaultValue = '0';
            break;
          case 'money_saved':
            dataType = 'DECIMAL(10,2)';
            defaultValue = '0.00';
            break;
          case 'notes':
            dataType = 'TEXT';
            defaultValue = 'NULL';
            break;
          default:
            dataType = 'VARCHAR(255)';
            defaultValue = 'NULL';
        }

        try {
          await pool.execute(`
            ALTER TABLE daily_progress 
            ADD COLUMN ${column} ${dataType} ${defaultValue === 'NULL' ? 'DEFAULT NULL' : `DEFAULT ${defaultValue}`}
          `);
          console.log(`✅ Đã thêm cột '${column}' vào bảng daily_progress`);
        } catch (alterError) {
          console.error(`❌ Không thể thêm cột '${column}':`, alterError);
        }
      }

      return sendSuccess(res, 'Đã cập nhật cấu trúc bảng daily_progress', {
        updatedColumns: missingColumns,
        status: 'updated'
      });
    }

    return sendSuccess(res, 'Cấu trúc bảng daily_progress đã phù hợp', {
      valid: true,
      columns: existingColumns,
      status: 'valid'
    });

  } catch (error) {
    console.error('Lỗi khi kiểm tra cấu trúc bảng:', error);
    return sendError(res, 'Không thể kiểm tra cấu trúc bảng', 500);
  }
};

// GET /api/health/daily-metrics/:date - Lấy chỉ số sức khỏe theo ngày
export const getDailyHealthMetrics = async (req, res) => {
  try {
    // Kiểm tra quyền truy cập
    if (!req.user || !req.user.id) {
      return sendError(res, 'Không có quyền truy cập, vui lòng đăng nhập', 401);
    }

    const { date } = req.params;

    if (!date) {
      return sendError(res, 'Cần cung cấp ngày để lấy dữ liệu', 400);
    }

    // Lấy dữ liệu sức khỏe theo ngày
    const [metrics] = await pool.execute(`
      SELECT 
        date,
        target_cigarettes,
        actual_cigarettes,
        cigarettes_avoided,
        money_saved,
        health_score,
        streak_days,
        notes
      FROM daily_progress 
      WHERE smoker_id = ? AND date = ?
    `, [req.user.id, date]);

    if (metrics.length === 0) {
      return sendError(res, 'Không tìm thấy dữ liệu sức khỏe cho ngày này', 404);
    }

    return sendSuccess(res, 'Lấy dữ liệu sức khỏe thành công', metrics[0]);

  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu sức khỏe theo ngày:', error);
    return sendError(res, 'Không thể lấy dữ liệu sức khỏe', 500);
  }
};
