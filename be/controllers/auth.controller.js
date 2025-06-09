const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { findUserByUsername, createUser } = require('../models/user.model');

// =========================
// ĐĂNG NHẬP
// =========================
exports.login = (req, res) => {
  const { username, password } = req.body;

  findUserByUsername(username, (err, user) => {
    if (err) return res.status(500).json({ message: 'Lỗi server' });
    if (!user) return res.status(401).json({ message: 'Sai tên đăng nhập hoặc mật khẩu' });

    // So sánh mật khẩu đã hash
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) return res.status(500).json({ message: 'Lỗi server' });
      if (!isMatch) return res.status(401).json({ message: 'Sai tên đăng nhập hoặc mật khẩu' });

      const token = jwt.sign(
        { user_id: user.user_id, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1d' }
      );

      res.json({
        token,
        user: {
          id: user.user_id,
          username: user.username,
          full_name: user.full_name,
          email: user.email,
          role: user.role
        },
      });
    });
  });
};

// =========================
// ĐĂNG KÝ
// =========================
exports.register = (req, res) => {
  const {
    username,
    password,
    full_name,
    dob,
    gender,
    email,
    identity_card,
    phone_number,
    address,
    role
  } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ message: 'Thiếu các trường bắt buộc (username, password, role)' });
  }

  findUserByUsername(username, async (err, existingUser) => {
    if (err) return res.status(500).json({ message: 'Lỗi server' });
    if (existingUser) return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = {
        username,
        password: hashedPassword,
        full_name,
        dob,
        gender,
        email,
        identity_card,
        phone_number,
        address,
        role,
        is_active: 1
      };

      createUser(newUser, (err, result) => {
        if (err) return res.status(500).json({ message: 'Lỗi khi tạo người dùng trong cơ sở dữ liệu' });

        res.status(201).json({ message: 'Tạo tài khoản thành công' });
      });
    } catch (err) {
      return res.status(500).json({ message: 'Lỗi khi mã hóa mật khẩu' });
    }
  });
};
