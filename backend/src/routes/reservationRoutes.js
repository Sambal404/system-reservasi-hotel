// /src/routes/reservationRoutes.js

const express = require("express");
const router = express.Router();
const { createNewReservation, getAllReservations, getReservationById } = require('../controllers/reservationController');
const { validateNewReservation }= require('../middlewares/validations/reservationValidation');
const { verifyToken, verifyRole } = require('../middlewares/auth'); 

router.get('/', getAllReservations);
router.post('/',verifyToken, verifyRole(['admin','staff']), validateNewReservation, createNewReservation);
router.get('/:id', getReservationById);

module.exports = router;

