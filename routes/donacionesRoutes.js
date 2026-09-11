const express = require("express");

const router = express.Router();

const {
    obtenerDonaciones,
    obtenerDonacionPorId,
    crearDonacion,
    actualizarDonacion,
    eliminarDonacion
} = require("../controllers/donacionesController");


router.get("/", obtenerDonaciones);

router.get("/:id", obtenerDonacionPorId);

router.post("/", crearDonacion);

router.put("/:id", actualizarDonacion);

router.delete("/:id", eliminarDonacion);


module.exports = router;