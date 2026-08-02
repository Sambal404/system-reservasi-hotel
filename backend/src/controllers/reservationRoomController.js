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
    updateReservationRoomById,
    addRoomToReservation,
    cancelReservationRoomById 
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

// PATCH /api/reservation-rooms/:id/checkin
const checkIn = async (req, res) => {
    try {
        const { id } = req.params; // reservation_room_ids
        const { room_id } = req.body; // Nomor kamar fisik yang dipilih saat check-in
        const userId = req.user.userId; // Dari middleware verifyToken

        if (!room_id) {
            return res.status(400).json({
                success: false,
                message: "room_id wajib diisi untuk melakukan check-in!"
            });
        }

        const result = await checkInRoom(id, room_id, userId);

        return res.status(200).json({
            success: true,
            message: "Check-in berhasil dicatat dan kamar fisik telah ditetapkan!",
            reservation_id: result
        });
    } catch (error) {
        console.error("Error checkIn:", error);
        return res.status(400).json({ 
            success: false, 
            message: error.message || "Internal server error" 
        });
    }
};

// PATCH /api/reservation-rooms/:id/checkout
const checkOut = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId; 

        const result = await checkOutRoom(id, userId);

        return res.status(200).json({
            success: true,
            message: "Check-out berhasil dicatat!",
            reservation_id : result
        });
    } catch (error) {
        console.error("Error checkOut:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};


// PUT /api/reservation-rooms/:id
// data = {
//     room_type_id,
//     room_id,
//     check_in_date,
//     check_out_date,
//     total_adults,
//     total_children
// }
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


const createReservationRoom = async (req, res) => {
  try {
    const data = req.body;
    
    // Validasi cepat (not safe)
    if (!data.reservation_id || !data.room_type_id || !data.price_per_night || !data.check_in_date || !data.check_out_date) {
      return res.status(400).json({ success: false, message: "Data tidak lengkap untuk menambahkan kamar reservasi." });
    }

    const newRoomId = await addRoomToReservation(data);

    return res.status(201).json({
      success: true,
      message: "Kamar berhasil ditambahkan ke dalam reservasi",
      data: { id: newRoomId }
    });
  } catch (error) {
    console.error("Error createReservationRoom:", error);
    return res.status(500).json({ success: false, message: "Internal server error saat menambah kamar." });
  }
};


const cancelReservationRoom = async (req, res) => {
    try {
      const { id } = req.params;
      
      await cancelReservationRoomById(id);
      
      return res.status(200).json({
        success: true,
        message: "Reservasi kamar berhasil dibatalkan (Status: canceled)."
      });
    } catch (error) {
      console.error("Error cancelReservationRoom:", error);
      return res.status(500).json({ success: false, message: "Internal server error saat membatalkan kamar." });
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