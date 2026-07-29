const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    // Input sudah divalidasi oleh middleware authValidation
    const { username, password } = req.body;

    try {
        // 1. Ambil data dari view vw_account berdasarkan username
        const [rows] = await pool.query(
            "SELECT * FROM vw_account WHERE username = ?",
            [username]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Username atau password salah"
            });
        }

        const user = rows[0];

        // 2. Check Password dengan bcrypt
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({
                success: false,
                message: "Username atau password salah"
            });
        }

        // 3. Cek Hak Akses Aplikasi Backend
        const myApp = process.env.APP_NAME || 'Front Office POS';
        
        const allowed = Array.isArray(user.access_rights) && 
            user.access_rights.some(access => access.app_name === myApp);

        if (!allowed) {
            return res.status(403).json({
                success: false,
                message: "Akses ditolak"
            });
        }

        // Ambil role spesifik untuk aplikasi ini
        const App = user.access_rights.find(access => access.app_name === myApp);

        // 4. Generate JWT Token
        const tokenPayload = {
            user_id: user.user_id,
            username: user.username,
            employee_name: user.employee_name,
            employee_position: user.employee_position,
            current_app: myApp,
            role: App ? App.role : null,
            access_rights: user.access_rights 
        };

        const token = jwt.sign(
            tokenPayload, 
            process.env.JWT_SECRET, 
            { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
        );

        // 5. Respons Berhasil (Mengirim token langsung di dalam JSON data)
        return res.status(200).json({
            success: true,
            message: "Login berhasil!",
            data: {
                token: token, // Token dikirim ke frontend untuk disimpan di LocalStorage
                user: {
                    user_id: user.user_id,
                    username: user.username,
                    employee_name: user.employee_name,
                    employee_position: user.employee_position,
                    current_role: App ? App.role : null,
                    access_rights: user.access_rights
                }
            }
        });

    } catch (error) {
        console.error('[AUTH ERROR]:', error);
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server internal.",
            error: error.message
        });
    }
};

module.exports = {
    login
};