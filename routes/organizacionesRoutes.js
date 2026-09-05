const express = require("express");

const router = express.Router();

const {
    obtenerOrganizaciones,
    obtenerOrganizacionPorId,
    crearOrganizacion,
    actualizarOrganizacion,
    eliminarOrganizacion
} = require("../controllers/organizacionesController");


router.get("/", obtenerOrganizaciones);

router.get("/:id", obtenerOrganizacionPorId);

router.post("/", crearOrganizacion);

router.put("/:id", actualizarOrganizacion);

router.delete("/:id", eliminarOrganizacion);


module.exports = router;