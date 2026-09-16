const express = require("express");
const router = express.Router();
const {
    renderHome,
    renderProyectos,
    renderCrearProyecto,
    guardarProyectoDesdeVista,
    renderProyectoDetalle,
    renderOrganizaciones,
    renderGastos,
    renderDonaciones,
    renderDonantes
} = require("../controllers/vistasController");

router.get("/", renderHome);
router.get("/proyectos", renderProyectos);
router.get("/proyectos/nuevo", renderCrearProyecto);
router.post("/proyectos", guardarProyectoDesdeVista);
router.get("/proyectos/:id", renderProyectoDetalle); // Ruta dinámica
router.get("/organizaciones", renderOrganizaciones);
router.get("/gastos", renderGastos);
router.get("/donaciones", renderDonaciones);
router.get("/donantes", renderDonantes);

module.exports = router;
