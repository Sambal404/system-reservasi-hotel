// /src/routes/reservationRoutes.js

const express = require("express");
const router = express.Router();

const { 
  createReservation, 
  getAllReservations, 
  getReservationById,
  updateGuestOfReservation,
  cancelReservation
} = require('../controllers/reservationController');

const { validateReservation }= require('../middlewares/validations/reservationValidation');
const { verifyToken, verifyRole } = require('../middlewares/auth'); 

router.get('/', verifyToken, getAllReservations);
router.post('/', verifyToken, verifyRole(['admin','staff']), validateReservation, createReservation);
router.get('/:id', verifyToken, getReservationById);
router.patch('/:id/guest', verifyToken, verifyRole(['admin','staff']), updateGuestOfReservation);
router.delete('/:id', verifyToken, verifyRole(['admin','staff']), cancelReservation);

// Endpoint reservation_rooms
// check in check out
const reservationRoomRoutes = require('./reservationRoomRoutes');
router.use('/:id/rooms', reservationRoomRoutes);

module.exports = router;

