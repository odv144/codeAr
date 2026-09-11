const express = require("express");
const router = express.Router();
const {
    renderHome,
    renderProyectos,
    renderProyectoDetalle,
    renderOrganizaciones,
    renderGastos,
    renderDonaciones
} = require("../controllers/vistasController");

router.get("/", renderHome);
router.get("/proyectos", renderProyectos);
router.get("/proyectos/:id", renderProyectoDetalle); // Ruta dinámica
router.get("/organizaciones", renderOrganizaciones);
router.get("/gastos", renderGastos);
router.get("/donaciones", renderDonaciones);

module.exports = router;
