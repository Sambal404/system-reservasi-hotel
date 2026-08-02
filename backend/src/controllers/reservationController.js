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

const { createReservation, getReservations, getReservation } = require('../models/reservationModel');


const createNewReservation = async (req, res) => {
    try {
        const { guest_id, rooms } = req.body;
        const user_id = req.user.userId; // Diambil dari middleware verifyToken

        // DEBUG: Cek apa yang sebenarnya dikirim
        console.log("DEBUG controller:", { guest_id, user_id, rooms });
        
        const result = await createReservation(guest_id, user_id, rooms);

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
}

const getAllReservations = async (req, res) => {
    try {
        const reservations = await getReservations();
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

const getReservationById = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const reservation = await getReservation(id);
        return res.status(200).json({
            success: true,
            data: reservation
        });
    } catch (error) {
        console.error("Error pada getAllReservations:", error);
        return res.status(500).json({
            success: false,
            message: "Gagal mengambil data reservasi."
        });
    }
}


const updateGuestOfReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { guest_id } = req.body;

    if (!guest_id) {
      return res.status(400).json({ 
        success: false, 
        message: "Data guest_id baru wajib dikirimkan." 
      });
    }

    await updateReservationGuest(id, guest_id);
    
    return res.status(200).json({ 
      success: true, 
      message: "Data penanggung jawab (Guest) untuk reservasi ini berhasil diperbarui." 
    });
  } catch (error) {
    console.error("Error pada updateGuestOfReservation:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Gagal memperbarui guest reservasi." 
    });
  }
};


module.exports = { 
  createNewReservation, 
  getAllReservations, 
  getReservationById,
  updateGuestOfReservation
};