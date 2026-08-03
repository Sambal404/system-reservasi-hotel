// /src/controllers/roomController.js
const roomModel = require('../models/roomModel');

// GET /api/rooms
const getAllRooms = async (req, res, next) => {
  try {
    const { status, roomTypeId, search, date } = req.query;
    const rooms = await roomModel.getAllRooms({ status, roomTypeId, search, date });

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil daftar kamar",
      data: rooms
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/rooms/available (Pencarian kamar kosong) 
const getAvailableRooms = async (req, res, next) => {
  try {
    const { checkInDate, checkOutDate, roomTypeId } = req.query;

    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({
        success: false,
        message: "Tanggal checkInDate dan checkOutDate wajib diisi."
      });
    }

    const availableRooms = await roomModel.getAvailableRooms({
      checkInDate,
      checkOutDate,
      roomTypeId
    });

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil daftar kamar yang tersedia untuk tanggal yang dipilih",
      data: availableRooms
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/rooms/available-today 
const getAvailableRoomsToday = async (req, res, next) => {
  try {
    const { roomTypeId } = req.query;

    const availableRoomsToday = await roomModel.getAvailableRoomsToday({ roomTypeId });

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil daftar kamar siap huni (kosong & bersih) untuk hari ini",
      data: availableRoomsToday
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/rooms/:id
const getRoomById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const room = await roomModel.getRoomById(id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Kamar tidak ditemukan"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil detail kamar",
      data: room
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllRooms,
  getAvailableRooms,
  getAvailableRoomsToday,
  getRoomById
};