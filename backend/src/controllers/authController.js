// /src/controllers/authController.js

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// authModel untuk query
const authModel = require("../models/authModel");

const applicationName = process.env.APP_NAME || "Front Office POS";

/**
 * Fitur login auth karyawan
 * POST /api/v1/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await authModel.findUserForLogin(username, applicationName);

    if (!user) {
      return res.status(401).json({ success: false, message: "Login gagal: Username atau aplikasi tidak sesuai" });
    }

    // Verifikasi Password
    const isPasswordValid = await bcrypt.compare(password, user.hashed_password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Login gagal: Password salah" });
    }

    // Update is_active menjadi TRUE 
    await authModel.updateUserActiveStatus(user.user_id, true);

    // Generate Payload JWT
    const payload = {
      userId: user.user_id,
      employeeId: user.employee_id,
      fullName: user.full_name,
      positionId: user.position_id,
      applicationId: user.application_id,
      applicationName: user.application_name,
      role: user.role,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || "secret_key_sementara",
      {
        expiresIn: "9h", // 8h shift + 1 hour toleransi untuk transisi
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login Berhasil",
      data: {
        token,
        user: {
          id: user.user_id,
          username: user.username,
          fullName: user.full_name,
          email: user.email,
          positionName: user.position_name,
          role: user.role,
        },
      },
    });
  } catch (err) {
    console.error("Error pada auth /api/v1/auth/login : ", err);
    next(err);
  }
};

/**
 * Fitur ambil data profil user yang sedang login
 * GET /api/v1/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const userId = req.user.userId; // Diambil dari middleware verifyToken

    const user = await authModel.findUserById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan" });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.error("Error pada auth /api/v1/auth/me : ", err);
    next(err);
  }
};

/**
 * Fitur logout user
 * POST /api/v1/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    const userId = req.user.userId; 

    // Update is_active menjadi FALSE
    await authModel.updateUserActiveStatus(userId, false);

    return res.status(200).json({ 
      success: true, 
      message: "Logout berhasil" 
    });
  } catch (error) {
    console.error("Error pada auth /api/v1/auth/logout : ", error);
    next(error);
  }
};

module.exports = {
  login,
  getMe,
  logout,
};