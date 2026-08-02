// /src/routes/roomRoutes.js

const express = require("express");
const router = express.Router();
const { getAllRooms, getRoomById, getAvailableRooms, getAvailableRoomsToday } = require("../controllers/roomController");

router.get("/", getAllRooms);
router.get("/:id", getRoomById);
router.get('/available', getAvailableRooms);
router.get('/available-today', getAvailableRoomsToday);

module.exports = router;
