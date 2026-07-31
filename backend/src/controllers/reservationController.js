// /src/controllers/reservationController.js

const ReservationModel = require('../models/reservationModel');


createReservation = async (req, res) => {
    try {
        const { guest_id, rooms } = req.body;
        const user_id = req.user.id; // Diambil dari middleware verifyToken

        const result = await ReservationModel.createReservationTransaction(guest_id, user_id, rooms);

        return res.status(201).json({
            success: true,
            message: "Reservasi berhasil dibuat!",
            data: {
                reservationId: result.reservationId,
                reservationCode: result.reservationCode
            }
        });

    } catch (error) {
        console.error("Error pada createReservation:", error);
        
        // Tangkap error spesifik kamar tersedia tidak mencukupi
        if (error.message.includes('tidak mencukupi')) {
            return res.status(409).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server saat memproses reservasi."
        });
    }
},

getAllReservations = async (req, res) => {
    try {
        const reservations = await ReservationModel.getAllReservations();
        return res.status(200).json({
            success: true,
            data: reservations
        });
    } catch (error) {
        console.error("Error pada getAllReservations:", error);
        return res.status(500).json({
            success: false,
            message: "Gagal mengambil data reservasi."
        });
    }
}


module.exports = reservationController;