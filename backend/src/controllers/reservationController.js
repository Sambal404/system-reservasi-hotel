// /src/controllers/reservationController.js

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

const reservationModel = require('../models/reservationModel');


// GET /api/reservations
const getAllReservations = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;

    const result = await reservationModel.getReservations({
      search,
      status,
      limit,
      offset
    });

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil daftar reservasi",
      data: result
    });
    
  } catch (error) {
    next(error);
  }
};


// POST /api/reservations
const createReservation = async (req, res, next) => {
  try {
    const { guest_id, rooms } = req.body;
    const user_id = req.user.userId; // Diambil dari middleware verifyToken

    const newReservationId = await reservationModel.createReservation(guest_id, user_id, rooms);
    
    return res.status(201).json({
      success: true,
      message: "Reservasi berhasil dibuat.",
      data: { reservation_id: newReservationId }
    });
  } catch (error) {
    next(error);
  }
};


// GET /api/reservations/:id
const getReservationById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const reservation = await reservationModel.getReservation(id);
    
    if (!reservation) {
        return res.status(404).json({ success: false, message: "Reservasi tidak ditemukan." });
    }

    return res.status(200).json({ success: true, data: reservation });
  } catch (error) {
    next(error);
  }
};


// PATCH /api/reservations/:id/guest
const updateGuestOfReservation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { guest_id } = req.body;

    if (!guest_id) {
        return res.status(400).json({ success: false, message: "guest_id wajib diisi." });
    }

    const affectedRows = await reservationModel.updateGuestOfReservation(id, guest_id);
    if (affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Reservasi tidak ditemukan atau tidak ada perubahan." });
    }

    return res.status(200).json({ success: true, message: "Penanggung jawab (Guest) reservasi berhasil diubah." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
    createReservation,
    getAllReservations,
    getReservationById,
    updateGuestOfReservation
};