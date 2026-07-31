// /src/middlewares/reservationValidation.js

const validateNewReservation = (req, res, next) => {
  const { guest_id, rooms } = req.body;

  // Validasi data tamu
  if (!guest_id) {
    return res.status(400).json({
      success: false,
      message: "ID Tamu (guest_id) wajib diisi!",
    });
  }

  // Validasi Kamar
  if (!rooms || !Array.isArray(rooms) || rooms.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Minimal harus memesan 1 kamar (rooms harus berupa array)!",
    });
  }

  // Validasi setiap item di dalam array rooms
  for (const [index, item] of rooms.entries()) {
    const { room_type_id, quantity, check_in_date, check_out_date } = item;

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

    // Validasi rentang tanggal
    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      return res.status(400).json({
        success: false,
        message: `Tanggal check-in tidak boleh di masa lalu!`,
      });
    }

    if (checkOut <= checkIn) {
      return res.status(400).json({
        success: false,
        message: `Tanggal check-out harus setelah tanggal check-in!`,
      });
    }
  }

  next();
};

module.exports = { validateNewReservation };