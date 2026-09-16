const express = require("express");
const router = express.Router();
const {
    renderHome,
    renderProyectos,
    renderCrearProyecto,
    guardarProyectoDesdeVista,
    renderProyectoDetalle,
    renderOrganizaciones,
    renderCrearOrganizacion,
    guardarOrganizacionDesdeVista,
    renderGastos,
    renderDonaciones,
    renderCrearDonacion,
    guardarDonacionDesdeVista,
    renderDonantes,
    renderCrearDonante,
    guardarDonanteDesdeVista
} = require("../controllers/vistasController");

router.get("/", renderHome);
router.get("/proyectos", renderProyectos);
router.get("/proyectos/nuevo", renderCrearProyecto);
router.post("/proyectos", guardarProyectoDesdeVista);
router.get("/proyectos/:id", renderProyectoDetalle); // Ruta dinámica

router.get("/organizaciones", renderOrganizaciones);
router.get("/organizaciones/nuevo", renderCrearOrganizacion);
router.post("/organizaciones", guardarOrganizacionDesdeVista);

router.get("/gastos", renderGastos);

router.get("/donaciones", renderDonaciones);
router.get("/donaciones/nuevo", renderCrearDonacion);
router.post("/donaciones", guardarDonacionDesdeVista);

router.get("/donantes", renderDonantes);
router.get("/donantes/nuevo", renderCrearDonante);
router.post("/donantes", guardarDonanteDesdeVista);

module.exports = router;
