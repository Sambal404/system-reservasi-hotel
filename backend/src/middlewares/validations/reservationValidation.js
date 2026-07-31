// /src/middlewares/reservationValidation.js

const db = require('../../config/db');

const validateNewReservation = async (req, res, next) => {
  try {
    const { guest_id, rooms } = req.body;

    // Debug
    console.log("[DEBUG] Masuk ke middleware validateNewReservation");
    
    // 1. Cek Tamu
    if (!guest_id) {
      return res.status(400).json({
        success: false,
        message: "ID Tamu (guest_id) wajib diisi!",
      });
    }

    // 2. Cek Room Array
    if (!rooms || !Array.isArray(rooms) || rooms.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Minimal harus memesan 1 kamar (rooms harus berupa array)!",
      });
    }

    // 3. Cek Tamu Terdaftar di Database
    const [guestCheck] = await db.query('SELECT id FROM guests WHERE id = ?', [guest_id]);
    if (guestCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Tamu dengan ID ${guest_id} tidak ditemukan di database!`,
      });
    }

    // 4. Validasi Struktur & Tanggal per Item Kamar
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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
    }

    // 5. Optimasi Pengecekan Tipe Kamar Secara Paralel (Promise.all)
    // Mengecek semua room_type_id sekaligus agar tidak memicu bottleneck di database
    const roomTypeValidations = rooms.map(async (item, index) => {
      const [roomTypeCheck] = await db.query('SELECT id FROM room_types WHERE id = ?', [item.room_type_id]);
      if (roomTypeCheck.length === 0) {
        throw new Error(`Tipe kamar (room_type_id: ${item.room_type_id}) pada indeks ke-${index} tidak valid atau tidak ditemukan!`);
      }
    });

    await Promise.all(roomTypeValidations);

    console.log("[DEBUG] Validasi Reservasi Berhasil, memanggil next()");
    next();

  } catch (error) {
    console.error("Error pada middleware validateNewReservation:", error.message);
    
    // Jika error berasal dari validasi room_type kustom di atas
    if (error.message.includes('tidak valid atau tidak ditemukan')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

module.exports = { validateNewReservation };