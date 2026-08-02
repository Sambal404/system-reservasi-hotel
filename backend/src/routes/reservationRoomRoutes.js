// /src/routes/reservationRoomRoutes.js

const express = require('express');
const router = express.Router();

const { 
    getReservationRooms, 
    checkIn, 
    checkOut, 
    updateReservationRoom,
    createReservationRoom,
    cancelReservationRoom 
  } = require('../controllers/reservationRoomController');
const { verifyToken, verifyRole } = require('../middlewares/auth');

router.get('/', verifyToken, getReservationRooms);
router.patch('/:id/checkin', verifyToken, checkIn);
router.patch('/:id/checkout', verifyToken, checkOut);
router.put('/:id', verifyToken, updateReservationRoom);
router.post('/', verifyToken, verifyRole(['admin', 'staff']), createReservationRoom);
router.delete('/:id', verifyToken, verifyRole(['admin', 'staff']), cancelReservationRoom);

module.exports = router;