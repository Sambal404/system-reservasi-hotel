// /src/middlewares/authValidation.js

const validateLogin = (req, res, next) => {
    const { username, password } = req.body;

    // Kumpulkan error jika ada yang kosong
    const errors = [];
    if (!username || username.trim() === '') {
        errors.push("Username wajib diisi.");
    }
    if (!password || password.trim() === "") {
        errors.push("Password wajib diisi.");
    }

    // Jika ada error, langsung tolak dengan status 400 Bad Request
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Validasi gagal",
            errors: errors
        });
    }

    // Jika aman, lanjutkan ke proses berikutnya (Controller)
    next();
};

module.exports = {
    validateLogin
};