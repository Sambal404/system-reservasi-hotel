// /src/middlewares/validations/reservationRoomValidation.js

// Validasi saat menambah kamar ke reservasi yang sudah ada
const validateAddRoom = (req, res, next) => {
    const { reservation_id, room_type_id, check_in_date, check_out_date } = req.body;

    if (!reservation_id || !room_type_id || !check_in_date || !check_out_date) {
        return res.status(400).json({ 
            success: false, 
            message: "reservation_id, room_type_id, check_in_date, dan check_out_date wajib diisi." 
        });
    }

    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);
    
    if (checkOut <= checkIn) {
        return res.status(400).json({
            success: false,
            message: "Tanggal check-out harus setelah tanggal check-in."
        });
    }

    next();
};

// Validasi khusus saat proses check-in
const validateCheckIn = (req, res, next) => {
    const { room_id } = req.body;
    
    // Saat check-in, resepsionis WAJIB mengalokasikan kamar fisik (misal: Kamar 101)
    if (!room_id) {
        return res.status(400).json({ 
            success: false, 
            message: "nomor kamar wajib dipilih saat proses Check-In." 
        });
    }

    next();
};

module.exports = {
    validateAddRoom,
    validateCheckIn
};