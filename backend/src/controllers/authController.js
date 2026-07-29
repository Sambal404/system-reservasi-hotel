const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

/**
 * Fitur login auth karyawan
 * POST /api/auth/login
 */

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username dan password wajib diisi" });
    }

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
        e.status AS employee_status
      FROM users u
      JOIN employees e ON u.employee_id = e.id
      WHERE u.username = ?
      LIMIT 1
    `;

    const [rows] = await db.execute(query, [username]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ message: "Username atau password salah" });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.hashed_password,
    );
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Username atau password salah" });
    }

    if (!user.is_user_active) {
      return res.status(403).json({
        success: false,
        message: "Akun anda belum aktif. Silahkan hubungi admin",
      });
    }

    if (user.employee_status !== "active") {
      const msg =
        user.employee_status === "resigned"
          ? "Akses ditolak. Status pegawai sudah Resigned"
          : "Akses ditolak. Status kepegawaian tidak aktif.";

      return res.status(403).json({ success: false, message: msg });
    }

    await db.execute(
      "UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [user.user_id],
    );

    const payload = {
      userId: user.user_id,
      employeeId: user.employee_id,
      fullName: user.full_name,
      positionId: user.position_id,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || "secret_key_sementara",
      {
        expiresIn: "2h",
      },
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
          positionId: user.position_id,
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
