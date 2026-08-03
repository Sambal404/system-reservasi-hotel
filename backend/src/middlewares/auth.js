// /src/middlewares/auth.js

// !NOTE!
// payload = {
//     userId: user.user_id,
//     employeeId: user.employee_id,
//     fullName: user.full_name,
//     positionId: user.position_id,
//     applicationId: user.application_id,
//     applicationName: user.application_name,
//     role: user.role,
// };

const jwt = require('jsonwebtoken');


const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Akses ditolak: Header Authorization tidak ditemukan."
        });
    }

    // DEBUG
    // console.log(authHeader);

    
    // Ekstrak token
    const token = authHeader.startsWith('Bearer ') 
        ? authHeader.split(' ')[1] 
        : authHeader;

    // DEBUG
    // console.log(token);

    if (!token || token === 'undefined' || token === 'null') {
        return res.status(401).json({
            success: false,
            message: "Akses ditolak: Format token salah atau kosong."
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key_sementara");
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({
            success: false,
            message: "Sesi tidak valid atau sudah kedaluwarsa."
        });
    }
};

// Pengecekan level access
// Paramaeter masukan 'admin' atau 'staff' dalam array ['admin'] or ['admin','staff']
const verifyRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({
                success: false,
                message: 'Akses ditolak: Informasi role tidak ditemukan dalam sesi.'
            });
        }

        const userRole = req.user.role;
        
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: `Akses ditolak: Role '${userRole}' tidak memiliki izin untuk mengakses fitur ini.`
            });
        }

        next();
    };
};

module.exports = { 
    verifyToken,
    verifyRole
};