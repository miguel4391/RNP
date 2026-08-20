const express = require("express");
const apiKey = require("../middleware/apiKey");
const rnpController = require("../controllers/rnpController");
const router = express.Router();



// POST /rnp
router.post("/rnp/:id", apiKey, rnpController.enviarProfissional);

module.exports = router;