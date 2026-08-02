// /src/controllers/authController.js

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const applicationName = process.env.APP_NAME || "Front Office POS";

/**
 * Fitur login auth karyawan
 * POST /api/auth/login
 */

const Login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const query = `
      SELECT
        u.id AS user_id,
        u.username,
        u.password AS hashed_password,
        u.is_active AS is_user_active,
        e.id AS employee_id,
        e.full_name,
        e.email,
        e.position_id,
        p.name AS employee_position,
        app.id AS application_id,
        app.name AS application_name,
        au.role
      FROM users u
      JOIN employees e ON u.employee_id = e.id
      JOIN positions p ON e.position_id = p.id
      JOIN application_users au ON u.id = au.user_id
      JOIN applications app ON au.application_id = app.id
      WHERE
        u.username = ? AND
        app.name = ?
      LIMIT 1
    `;

    const [rows] = await db.execute(query, [username, applicationName]);
    
    // Verifikasi username, app, password
    if (!rows[0]) {
      return res.status(401).json({ success: false, message: "Login gagal" });
    }

    const user = rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.hashed_password);
    if (!isPasswordValid || !user.is_user_active) {
      return res.status(401).json({ success: false, message: "Login gagal" });
    }

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
  } catch (error) {
    console.error("Error pada auth login", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};

module.exports = Login;