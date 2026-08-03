// /src/routes/roomRoutes.js

const express = require("express");
const router = express.Router();
const { 
    getAllRooms, 
    getRoomById, 
    getAvailableRooms, 
    getAvailableRoomsToday,
    checkRoomAvailability
} = require("../controllers/roomController");
const { verifyToken, verifyRole } = require('../middlewares/auth');


router.get("/", verifyToken, getAllRooms);
router.get("/by/:id", verifyToken, getRoomById);
router.get('/available', verifyToken, getAvailableRooms);
router.get('/available-today', verifyToken, getAvailableRoomsToday);
router.get('/check-availability', verifyToken, checkRoomAvailability);

module.exports = router;
