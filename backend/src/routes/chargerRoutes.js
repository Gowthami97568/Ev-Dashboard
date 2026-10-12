const express = require("express");
const { requireModulePermission } = require("../controllers/permissionsController");

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

router.post("/", requireModulePermission("chargeMaster"), createCharger);

router.put("/:deviceid", requireModulePermission("chargeMaster"), updateCharger);

router.delete("/:deviceid", requireModulePermission("chargeMaster"), deleteCharger);

module.exports = router;