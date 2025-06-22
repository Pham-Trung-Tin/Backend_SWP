// Phần 2 - Tiếp tục API cho các module còn lại
// Thêm vào cuối file server-api-full.js

// ===== PROGRESS TRACKING API =====
// Thêm progress tracking
app.post('/api/progress', authenticateToken, async (req, res) => {
  try {
    const { planId, status, note, cravingLevel } = req.body;

    if (!planId) {
      return res.status(400).json({
        success: false,
        message: 'PlanID là bắt buộc'
      });
    }

    // Kiểm tra plan có tồn tại và thuộc quyền sở hữu
    const [plans] = await pool.query('SELECT UserID FROM QuitSmokingPlan WHERE PlanID = ?', [planId]);
    
    if (plans.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kế hoạch không tồn tại'
      });
    }
    
    if (req.user.RoleName !== 'Admin' && plans[0].UserID !== req.user.UserID) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền thêm progress cho kế hoạch này'
      });
    }

    const [result] = await pool.query(`
      INSERT INTO ProgressTracking (PlanID, Status, Note, CravingLevel) 
      VALUES (?, ?, ?, ?)
    `, [planId, status || null, note || null, cravingLevel || null]);

    res.status(201).json({
      success: true,
      message: 'Thêm progress tracking thành công',
      data: {
        trackingId: result.insertId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi thêm progress tracking',
      error: error.message
    });
  }
});

// Lấy progress tracking
app.get('/api/progress', authenticateToken, async (req, res) => {
  try {
    const { planId, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT pt.*, p.Title as PlanTitle, u.Name as UserName
      FROM ProgressTracking pt
      JOIN QuitSmokingPlan p ON pt.PlanID = p.PlanID
      JOIN User u ON p.UserID = u.UserID
    `;
    
    const queryParams = [];
    const conditions = [];
    
    if (planId) {
      conditions.push('pt.PlanID = ?');
      queryParams.push(planId);
    }
    
    // Nếu không phải admin, chỉ xem được progress của mình
    if (req.user.RoleName !== 'Admin') {
      conditions.push('p.UserID = ?');
      queryParams.push(req.user.UserID);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY pt.TrackingDate DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), parseInt(offset));

    const [progress] = await pool.query(query, queryParams);

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy progress tracking',
      error: error.message
    });
  }
});

// ===== PACKAGE API =====
// Lấy danh sách packages
app.get('/api/packages', async (req, res) => {
  try {
    const [packages] = await pool.query(`
      SELECT p.*, u.Name as CreatedByName
      FROM Package p
      LEFT JOIN User u ON p.CreatedByUserID = u.UserID
      WHERE p.IsActive = 1
      ORDER BY p.Price ASC
    `);

    res.json({
      success: true,
      data: packages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách packages',
      error: error.message
    });
  }
});

// Tạo package (chỉ admin)
app.post('/api/packages', authenticateToken, async (req, res) => {
  try {
    if (req.user.RoleName !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ Admin mới có quyền tạo package'
      });
    }

    const { name, description, features, price, durationDays } = req.body;

    if (!name || !price || !durationDays) {
      return res.status(400).json({
        success: false,
        message: 'Name, price và durationDays là bắt buộc'
      });
    }

    const [result] = await pool.query(`
      INSERT INTO Package (Name, Description, Features, Price, DurationDays, CreatedByUserID) 
      VALUES (?, ?, ?, ?, ?, ?)
    `, [name, description || null, features || null, price, durationDays, req.user.UserID]);

    res.status(201).json({
      success: true,
      message: 'Tạo package thành công',
      data: {
        packageId: result.insertId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo package',
      error: error.message
    });
  }
});

// ===== MEMBERSHIP API =====
// Lấy membership của user
app.get('/api/membership/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Kiểm tra quyền truy cập
    if (req.user.RoleName !== 'Admin' && req.user.UserID != userId) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền xem membership của user này'
      });
    }

    const [memberships] = await pool.query(`
      SELECT m.*, p.Name as PackageName, p.Description, p.Features, u.Name as UserName
      FROM Membership m
      JOIN Package p ON m.PackageID = p.PackageID
      JOIN User u ON m.UserID = u.UserID
      WHERE m.UserID = ? AND m.Status = 'active'
      ORDER BY m.EndDate DESC
    `, [userId]);

    res.json({
      success: true,
      data: memberships
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin membership',
      error: error.message
    });
  }
});

// ===== BOOKING API =====
// Tạo booking
app.post('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const { coachUserId, bookingDate } = req.body;
    const userId = req.user.UserID;

    if (!coachUserId || !bookingDate) {
      return res.status(400).json({
        success: false,
        message: 'CoachUserId và bookingDate là bắt buộc'
      });
    }

    // Kiểm tra coach có tồn tại và có role là Coach
    const [coaches] = await pool.query(`
      SELECT u.UserID 
      FROM User u 
      JOIN Role r ON u.RoleID = r.RoleID 
      WHERE u.UserID = ? AND r.RoleName = 'Coach'
    `, [coachUserId]);

    if (coaches.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Coach không tồn tại'
      });
    }

    const [result] = await pool.query(`
      INSERT INTO Booking (UserID, CoachUserID, BookingDate) 
      VALUES (?, ?, ?)
    `, [userId, coachUserId, bookingDate]);

    res.status(201).json({
      success: true,
      message: 'Tạo booking thành công',
      data: {
        bookingId: result.insertId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo booking',
      error: error.message
    });
  }
});

// Lấy danh sách bookings
app.get('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT b.*, u.Name as UserName, c.Name as CoachName
      FROM Booking b
      JOIN User u ON b.UserID = u.UserID
      JOIN User c ON b.CoachUserID = c.UserID
    `;
    
    const queryParams = [];
    const conditions = [];
    
    // Nếu không phải admin, chỉ xem được booking của mình hoặc được book
    if (req.user.RoleName !== 'Admin') {
      conditions.push('(b.UserID = ? OR b.CoachUserID = ?)');
      queryParams.push(req.user.UserID, req.user.UserID);
    }
    
    if (status) {
      conditions.push('b.Status = ?');
      queryParams.push(status);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY b.BookingDate DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), parseInt(offset));

    const [bookings] = await pool.query(query, queryParams);

    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách bookings',
      error: error.message
    });
  }
});

// Cập nhật status booking
app.put('/api/bookings/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status là bắt buộc'
      });
    }

    // Kiểm tra booking có tồn tại
    const [bookings] = await pool.query('SELECT * FROM Booking WHERE BookingID = ?', [id]);
    
    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking không tồn tại'
      });
    }

    const booking = bookings[0];

    // Kiểm tra quyền (chỉ coach hoặc admin mới được cập nhật status)
    if (req.user.RoleName !== 'Admin' && booking.CoachUserID !== req.user.UserID) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền cập nhật booking này'
      });
    }

    await pool.query(`
      UPDATE Booking 
      SET Status = ?, ApprovedByUserID = ?, ApprovedDate = NOW() 
      WHERE BookingID = ?
    `, [status, req.user.UserID, id]);

    res.json({
      success: true,
      message: 'Cập nhật status booking thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật booking',
      error: error.message
    });
  }
});

// ===== BLOG API =====
// Lấy danh sách blogs
app.get('/api/blogs', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const [blogs] = await pool.query(`
      SELECT b.*, u.Name as AuthorName
      FROM Blog b
      JOIN User u ON b.AuthorUserID = u.UserID
      ORDER BY b.CreatedAt DESC
      LIMIT ? OFFSET ?
    `, [parseInt(limit), parseInt(offset)]);

    res.json({
      success: true,
      data: blogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách blogs',
      error: error.message
    });
  }
});

// Lấy blog theo ID
app.get('/api/blogs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [blogs] = await pool.query(`
      SELECT b.*, u.Name as AuthorName
      FROM Blog b
      JOIN User u ON b.AuthorUserID = u.UserID
      WHERE b.BlogID = ?
    `, [id]);
    
    if (blogs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Blog không tồn tại'
      });
    }
    
    res.json({
      success: true,
      data: blogs[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin blog',
      error: error.message
    });
  }
});

// Tạo blog (chỉ admin và coach)
app.post('/api/blogs', authenticateToken, async (req, res) => {
  try {
    if (!['Admin', 'Coach'].includes(req.user.RoleName)) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ Admin và Coach mới có quyền tạo blog'
      });
    }

    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title và content là bắt buộc'
      });
    }

    const [result] = await pool.query(`
      INSERT INTO Blog (Title, Content, AuthorUserID) 
      VALUES (?, ?, ?)
    `, [title, content, req.user.UserID]);

    res.status(201).json({
      success: true,
      message: 'Tạo blog thành công',
      data: {
        blogId: result.insertId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo blog',
      error: error.message
    });
  }
});

// ===== ACHIEVEMENT API =====
// Lấy danh sách achievements
app.get('/api/achievements', async (req, res) => {
  try {
    const [achievements] = await pool.query(`
      SELECT a.*, u.Name as CreatedByName
      FROM Achievement a
      JOIN User u ON a.CreatedByUserID = u.UserID
      ORDER BY a.AchievementID
    `);

    res.json({
      success: true,
      data: achievements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách achievements',
      error: error.message
    });
  }
});

// Lấy achievements của user
app.get('/api/users/:userId/achievements', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    const [userAchievements] = await pool.query(`
      SELECT sa.*, a.Title, a.Description, p.Title as PlanTitle
      FROM SmokerAchievement sa
      JOIN Achievement a ON sa.AchievementID = a.AchievementID
      LEFT JOIN QuitSmokingPlan p ON sa.PlanID = p.PlanID
      WHERE sa.UserID = ?
      ORDER BY sa.EarnedDate DESC
    `, [userId]);

    res.json({
      success: true,
      data: userAchievements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy achievements của user',
      error: error.message
    });
  }
});
