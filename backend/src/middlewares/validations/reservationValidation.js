// /src/middlewares/validations/reservationValidation.js

// Validasi sebelum membuat reservasi
const validateReservation = async (req, res, next) => {
    try {
      const { guest_id, rooms } = req.body;
      
      // Cek guest_id
      if (!guest_id) {
        return res.status(400).json({
          success: false,
          message: "guest_id wajib diisi."
        });
      }

      // Cek [{rooms}]
      if (!rooms || !Array.isArray(rooms) || rooms.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Minimal harus memilih 1 kamar."
        });
      }

      // Validasi setiap kamar di dalam array
      for (let i = 0; i < rooms.length; i++) {
        const room = rooms[i];
        if (!room.room_type_id || !room.check_in_date || !room.check_out_date || !room.price_per_night) {
             return res.status(400).json({ 
                 success: false, 
                 message: `Data kamar pada index ${i} tidak lengkap.` 
             });
        }
      }
  
      next();
    } catch (error) {
      console.error("Error pada middleware validateReservation:", error.message);
      return res.status(500).json({
        success: false,
        message: "Internal server error saat validasi data."
      });
    }
  };
  
  module.exports = { validateReservation };