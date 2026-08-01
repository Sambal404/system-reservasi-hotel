// /src/controllers/reservationRoomController.js

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

const { 
    getAllReservationRooms, 
    checkInRoom, 
    checkOutRoom, 
    updateReservationRoomById
} = require('../models/reservationRoomModel');

// GET /api/reservation-rooms/
const getReservationRooms = async (req, res) => {
    try {
        const rooms = await getAllReservationRooms();
        return res.status(200).json({
            success: true,
            message: "Berhasil mengambil daftar reservation rooms",
            data: rooms
        });
    } catch (error) {
        console.error("Error getReservationRooms:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// PUT /api/reservation-rooms/:id/checkin
const checkIn = async (req, res) => {
    try {
        const { id } = req.params; // reservation_room_id
        const userId = req.user.userId; // Token JWT

        const affectedRows = await checkInRoom(id, userId);
        if (affectedRows === 0) {
            return res.status(400).json({
                success: false,
                message: "Gagal check-in. Kamar mungkin tidak ditemukan atau status bukan 'booked'."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Check-in berhasil dicatat!"
        });
    } catch (error) {
        console.error("Error checkIn:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// PUT /api/reservation-rooms/:id/checkout
const checkOut = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId; 

        const affectedRows = await checkOutRoom(id, userId);
        if (affectedRows === 0) {
            return res.status(400).json({
                success: false,
                message: "Gagal check-out. Kamar mungkin tidak ditemukan atau belum dalam status 'checked_in'."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Check-out berhasil dicatat!"
        });
    } catch (error) {
        console.error("Error checkOut:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// PUT /api/reservation-rooms/:id
const updateReservationRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const affectedRows = await updateReservationRoomById(id, data);
        if (affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Detail reservation room tidak ditemukan."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Detail reservation room berhasil diperbarui!"
        });
    } catch (error) {
        console.error("Error updateReservationRoom:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports = {
    getReservationRooms,
    checkIn,
    checkOut,
    updateReservationRoom
};