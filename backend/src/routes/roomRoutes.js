// /src/routes/roomRoutes.js

const express = require("express");
const router = express.Router();
const { 
    getAllRooms, 
    getRoomById, 
    getAvailableRooms, 
    getAvailableRoomsToday 
} = require("../controllers/roomController");
const { verifyToken, verifyRole } = require('../middlewares/auth');


router.get("/", verifyToken, getAllRooms);
router.get("/:id", verifyToken, getRoomById);
router.get('/available', verifyToken, getAvailableRooms);
router.get('/available-today', verifyToken, getAvailableRoomsToday);

module.exports = router;
