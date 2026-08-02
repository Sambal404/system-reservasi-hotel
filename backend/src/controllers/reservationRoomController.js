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
// /src/controllers/reservationRoomController.js

const { 
    getAllReservationRooms,
    checkInRoom,
    checkOutRoom, 
    updateReservationRoomById,
    addRoomToReservation,
    cancelReservationRoomById 
} = require('../models/reservationRoomModel');

// GET /api/reservation-rooms/
const getReservationRooms = async (req, res, next) => {
    try {
      const { roomStatus, searchRoomNumber } = req.query;
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const offset = (page - 1) * limit;
  
      const result = await getAllReservationRooms({
        roomStatus,
        searchRoomNumber,
        limit,
        offset
      });
  
      return res.status(200).json({ 
        success: true, 
        data: result
      });
    } catch (error) { 
      next(error); 
    }
};

// PATCH /api/reservation-rooms/:id/checkin
const checkIn = async (req, res, next) => {
    try {
        const { id } = req.params; // reservation_room_id
        const { room_id } = req.body; // Nomor kamar fisik wajib dipilih saat tamu tiba
        const userId = req.user.userId;

        if (!room_id) {
            return res.status(400).json({ success: false, message: "Kamar fisik (room_id) wajib dipilih saat proses check-in." });
        }

        await checkInRoom(id, room_id, userId);
        return res.status(200).json({ success: true, message: "Proses Check-in berhasil, status kamar menjadi occupied." });
    } catch (error) {
        next(error);
    }
};

// PATCH /api/reservation-rooms/:id/checkout
const checkOut = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        await checkOutRoom(id, userId);
        return res.status(200).json({ success: true, message: "Proses Check-out berhasil. Kamar siap dibersihkan (dirty)." });
    } catch (error) {
        next(error);
    }
};

// PUT /api/reservation-rooms/:id
const updateReservationRoom = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = req.body;
        
        const affectedRows = await updateReservationRoomById(id, data);
        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Kamar reservasi tidak ditemukan atau tidak ada perubahan." });
        }

        return res.status(200).json({ success: true, message: "Detail kamar reservasi berhasil diperbarui." });
    } catch (error) {
        next(error);
    }
};

// POST /api/reservation-rooms
const createReservationRoom = async (req, res, next) => {
    try {
        const data = req.body;
        
        if (!data.reservation_id || !data.room_type_id || !data.check_in_date || !data.check_out_date) {
            return res.status(400).json({ success: false, message: "Data tidak lengkap. reservation_id, room_type_id, check_in_date, dan check_out_date wajib diisi." });
        }

        const newRoomId = await addRoomToReservation(data);
        return res.status(201).json({ 
            success: true, 
            message: "Kamar tambahan berhasil ditambahkan ke reservasi.",
            data: { reservation_room_id: newRoomId }
        });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/reservation-rooms/:id
const cancelReservationRoom = async (req, res, next) => {
    try {
        const { id } = req.params;
        const affectedRows = await cancelReservationRoomById(id);

        if (affectedRows === 0) {
             return res.status(404).json({ success: false, message: "Kamar reservasi tidak ditemukan." });
        }

        return res.status(200).json({ success: true, message: "Kamar reservasi berhasil dibatalkan (Status: Canceled)." });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getReservationRooms,
    checkIn,
    checkOut,
    updateReservationRoom,
    createReservationRoom,
    cancelReservationRoom
};