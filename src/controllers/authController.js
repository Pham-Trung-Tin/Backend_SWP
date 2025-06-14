const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// Hàm tạo JWT token để xác thực người dùng (dựa trên UserID)
const generateToken = (UserID) => {
  return jwt.sign({ UserID }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });
};
exports.register = async (req, res) => {
  // const { name, email, password, age, gender, phone, address } = req.body;

    // Chỉ lấy các field cần thiết từ request body
  const { name, email, password, phone } = req.body;

  try {
    // Kiểm tra trùng email
    const existingEmail = await User.findOne({ where: { Email: email } });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use',
      });
    }

    // Tạo user mới - password sẽ được hash trong model 
    // const newUser = await User.create({
    //   name,
    //   email,
    //   password, 
    //   age,
    //   gender,
    //   phone,
    //   address
    // });

     // Tạo user mới với các field đã giảm
    const newUser = await User.create({
      name,
      email,
      password, 
      phone
    });

     // Tạo token để người dùng không cần đăng nhập lại sau khi đăng ký
    const token = generateToken(newUser.UserID);

    // return res.status(201).json({
    //   success: true,
    //   message: 'User registered successfully',
    //   user: newUser,
    // });

    return res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      token,
      user: {
        id: newUser.UserID,
        name: newUser.Name,
        email: newUser.Email,
        phone: newUser.Phone,
        membershipType: 'free' // Mặc định là free khi đăng ký mới
      }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// Register a new user
// exports.register = async (req, res, next) => {
//   try {
//     const { name, email, password,  } = req.body;

//     // Check if user already exists
//     const existingUser = await User.findByEmail(email);
//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email already in use'
//       });
//     }

//     // Check if username is taken
//     const existingUsername = await User.findByUsername(username);
//     if (existingUsername) {
//       return res.status(400).json({
//         success: false,
//         message: 'Username already taken'
//       });
//     }

//     // Create new user
//     const newUser = await User.create({
//          Name: name,
//       Email: email,
//       Password: password, // 👉 nếu có bcrypt thì hash trước
//       Age: age,
//       Gender: gender,
//       Phone: phone,
//       Address: address,
//       RegisterDate: new Date(), // gán ngày hiện tại
//       RoleID: 2,                // gán role mặc định (ví dụ: user)
//       IsActive: true,
//     });

//     // Generate token
//     const token = generateToken(newUser.id);

//     res.status(201).json({
//       success: true,
//       token,
//       user: {
//         id: newUser.id,
//         username: newUser.username,
//         email: newUser.email,
//         fullName: newUser.fullName,
//         membershipType: 'free'
//       }
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if password is correct
    const isPasswordValid = await User.comparePassword(password, user.Password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user.UserID);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.UserID,
        name: user.Name,
        email: user.Email,
        age: user.Age,
        gender: user.Gender,
        phone: user.Phone,
        address: user.Address,
        membershipType: user.Membership
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.UserID);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.UserID,
        name: user.Name,
        email: user.Email,
        age: user.Age,
        gender: user.Gender,
        phone: user.Phone, 
        address: user.Address,
        registerDate: user.RegisterDate,
        roleID: user.RoleID,
        isActive: user.IsActive,
        membershipType: user.Membership,
        profileImage: user.ProfileImage
      }
    });
  } catch (error) {
    next(error);
  }
};