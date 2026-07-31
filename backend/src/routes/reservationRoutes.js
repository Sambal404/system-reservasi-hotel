const express = require("express");
const router = express.Router();
const { createNewReservation, getAllReservations } = require('../controllers/reservationController');
const { validateNewReservation }= require('../middlewares/validations/reservationValidation');
const { verifyToken, verifyRole } = require('../middlewares/auth'); 

router.get('/', getAllReservations);
router.post('/',verifyToken, verifyRole(['admin','staff']), validateNewReservation, createNewReservation);

module.exports = router;

