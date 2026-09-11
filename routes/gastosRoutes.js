const express = require("express");

const router = express.Router();

const {
    obtenerGastos,
    obtenerGastoPorId,
    crearGasto,
    actualizarGasto,
    eliminarGasto
} = require("../controllers/gastosController");


router.get("/", obtenerGastos);

router.get("/:id", obtenerGastoPorId);

router.post("/", crearGasto);

router.put("/:id", actualizarGasto);

router.delete("/:id", eliminarGasto);


module.exports = router;
