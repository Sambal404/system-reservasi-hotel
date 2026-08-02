// /src/routes/roomRoutes.js

const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController").default;

router.get("/", roomController.getRooms);
router.get("/:id", roomController.getRoom);

module.exports = router;
