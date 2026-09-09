const express = require("express");

const {
    getChargerSummary,
    getChargers,
    getChargerById,
    createCharger,
    updateCharger,
    deleteCharger
} = require("../controllers/chargerController");

const router = express.Router();

router.get("/summary", getChargerSummary);

router.get("/", getChargers);

router.get("/:deviceid", getChargerById);

router.post("/", createCharger);

router.put("/:deviceid", updateCharger);

router.delete("/:deviceid", deleteCharger);

module.exports = router;