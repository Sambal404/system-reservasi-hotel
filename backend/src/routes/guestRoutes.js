// /src/routes/guestRoutes.js

const express = require ("express");
const router = express.Router();

const {getGuest} = require ("../controllers/guestController");
const {getGuestById} = require ("../controllers/guestController");
const {createGuest} = require ("../controllers/guestController");
const {updateGuest} = require ("../controllers/guestController");
const {deleteGuest} = require ("../controllers/guestController");

const {verifyToken, verifyRole}= require ("../middlewares/auth");
const {validateGuestCreate, validateGuestUpdate} = require ("../middlewares/validations/guestValidation");

//publik - ga perlu token
router.get("/", verifyToken, getGuest);
router.get("/:id", verifyToken, getGuestById);

//protected - perlu token, ini ngelewatin middleware auth dulu
router.post("/",  verifyToken, validateGuestCreate, createGuest);
router.put("/:id", verifyToken, validateGuestUpdate, updateGuest);
router.delete("/:id", verifyToken, verifyRole(["admin", "staff"]), deleteGuest);

module.exports = router;