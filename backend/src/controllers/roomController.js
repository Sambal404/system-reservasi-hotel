const roomModel = require("../models/roomModel").default;

const getRooms = async (req, res) => {
  try {
    const { status, roomTypeId, search } = req.query;
    const rooms = await roomModel.getAllRooms({ status, roomTypeId, search });
    return res.json({ success: true, data: rooms });
  } catch (err) {
    console.error("Error getRooms:", err);
    return res
      .status(500)
      .json({ success: false, message: "Gagal mengambil data kamar" });
  }
};

const getRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await roomModel.getRoomById(id);
    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Kamar tidak ditemukan" });
    }
    return res.json({ success: true, data: room });
  } catch (err) {
    console.error("Error getRoom:", err);
    return res
      .status(500)
      .json({ success: false, message: "Gagal mengambil data kamar" });
  }
};

module.exports.default = {
  getRooms,
  getRoom,
};
