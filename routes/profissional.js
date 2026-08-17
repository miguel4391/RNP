const express = require("express");
const profissionalController = require("../controllers/profissionalController");
const apiKey = require("../middleware/apiKey");

const router = express.Router();

router.post(
    "/profissional/:id",
    apiKey,
    profissionalController.enviar
);

module.exports = router;