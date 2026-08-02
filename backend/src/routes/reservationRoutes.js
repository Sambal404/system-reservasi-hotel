// /src/routes/reservationRoutes.js

const express = require("express");
const router = express.Router();

const { 
  createNewReservation, 
  getAllReservations, 
  getReservationById,
  updateGuestOfReservation 
} = require('../controllers/reservationController');
const { validateNewReservation }= require('../middlewares/validations/reservationValidation');
const { verifyToken, verifyRole } = require('../middlewares/auth'); 

router.get('/', getAllReservations);
router.post('/',verifyToken, verifyRole(['admin','staff']), validateNewReservation, createNewReservation);
router.get('/:id', getReservationById);
router.patch('/:id/guest', verifyToken, verifyRole(['admin','staff']), updateGuestOfReservation);

module.exports = router;

