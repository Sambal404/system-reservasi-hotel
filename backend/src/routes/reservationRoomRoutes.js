const express = require('express');
const router = express.Router();
const { 
    getReservationRooms, 
    checkIn, 
    checkOut, 
    updateReservationRoom 
} = require('../controllers/reservationRoomController');
const { verifyToken, verifyRole } = require('../middlewares/auth');

router.get('/', verifyToken, getReservationRooms);
router.put('/:id/checkin', verifyToken, checkIn);
router.put('/:id/checkout', verifyToken, checkOut);
router.put('/:id', verifyToken, updateReservationRoom);

module.exports = router;