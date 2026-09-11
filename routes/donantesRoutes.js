const express = require("express");

const router = express.Router();

const {
    obtenerDonantes,
    obtenerDonantePorId,
    crearDonante,
    actualizarDonante,
    eliminarDonante
} = require("../controllers/donantesController");

router.get("/", obtenerDonantes);

router.get("/:id", obtenerDonantePorId);

router.post("/", crearDonante);

router.put("/:id", actualizarDonante);

router.delete("/:id", eliminarDonante);

module.exports = router;