// /src/middlewares/reservationValidation.js

const db = require('../config/db'); // Pastikan path ini sesuai dengan letak file db.js Anda

const validateNewReservation = async (req, res, next) => {
  try {
    const { guest_id, rooms } = req.body;

    // Cek Tamu
    if (!guest_id) {
      return res.status(400).json({
        success: false,
        message: "ID Tamu (guest_id) wajib diisi!",
      });
    }

    // Cek Room
    if (!rooms || !Array.isArray(rooms) || rooms.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Minimal harus memesan 1 kamar (rooms harus berupa array)!",
      });
    }

    // Cek tamu sudah terdaftar?
    const [guestCheck] = await db.query('SELECT id FROM guests WHERE id = ?', [guest_id]);
    if (guestCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Tamu dengan ID ${guest_id} tidak ditemukan di database!`,
      });
    }

    // Cek detail reservasi
    for (const [index, item] of rooms.entries()) {
      const { room_type_id, quantity, check_in_date, check_out_date } = item;

      // Validasi kelengkapan data per item
      if (!room_type_id || !quantity || !check_in_date || !check_out_date) {
        return res.status(400).json({
          success: false,
          message: `Data pada indeks kamar ke-${index} tidak lengkap! Wajib memiliki room_type_id, quantity, check_in_date, dan check_out_date.`,
        });
      }

      if (quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: `Kuantitas kamar pada indeks ke-${index} harus lebih besar dari 0!`,
        });
      }

      // Validasi tanggal
      const checkIn = new Date(check_in_date);
      const checkOut = new Date(check_out_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (checkIn < today) {
        return res.status(400).json({
          success: false,
          message: `Tanggal check-in pada indeks ke-${index} tidak boleh di masa lalu!`,
        });
      }

      if (checkOut <= checkIn) {
        return res.status(400).json({
          success: false,
          message: `Tanggal check-out pada indeks ke-${index} harus setelah tanggal check-in!`,
        });
      }

      // Cek tipe kamar
      const [roomTypeCheck] = await db.query('SELECT id FROM room_types WHERE id = ?', [room_type_id]);
      if (roomTypeCheck.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Tipe kamar (room_type_id: ${room_type_id}) pada indeks ke-${index} tidak valid atau tidak ditemukan!`,
        });
      }
    }

    next();

  } catch (error) {
    console.error("Error pada middleware validateNewReservation:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

module.exports = { validateNewReservation };