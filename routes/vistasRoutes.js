import express from "express";
import {
    renderHome,
    renderProyectos,
    renderCrearProyecto,
    guardarProyectoDesdeVista,
    renderProyectoDetalle,
    renderEditarProyecto,
    guardarEdicionProyecto,
    renderEliminarProyecto,
    eliminarProyectoVista,
    renderOrganizaciones,
    renderCrearOrganizacion,
    guardarOrganizacionDesdeVista,
    renderOrganizacionDetalle,
    renderEditarOrganizacion,
    guardarEdicionOrganizacion,
    renderEliminarOrganizacion,
    eliminarOrganizacionVista,
    renderGastos,
    renderCrearGasto,
    guardarGastoDesdeVista,
    renderDonaciones,
    renderCrearDonacion,
    guardarDonacionDesdeVista,
    renderDonacionDetalle,
    renderEditarDonacion,
    guardarEdicionDonacion,
    renderEliminarDonacion,
    eliminarDonacionVista,
    renderDonantes,
    renderCrearDonante,
    guardarDonanteDesdeVista
} from "../controllers/vistasController.js";
import { validarId } from "../middlewares/validarId.js";

const router = express.Router();

router.get("/", renderHome);

// PROYECTOS (IDs numéricos: idProyecto)
router.get("/proyectos", renderProyectos);
router.get("/proyectos/nuevo", renderCrearProyecto);
router.post("/proyectos", guardarProyectoDesdeVista);
router.get("/proyectos/:id", validarId, renderProyectoDetalle);
router.get("/proyectos/:id/editar", validarId, renderEditarProyecto);
router.post("/proyectos/:id/editar", validarId, guardarEdicionProyecto);
router.get("/proyectos/:id/eliminar", validarId, renderEliminarProyecto);
router.post("/proyectos/:id/eliminar", validarId, eliminarProyectoVista);

// ORGANIZACIONES (IDs numéricos: idOrganizacion, eliminar = baja lógica)
router.get("/organizaciones", renderOrganizaciones);
router.get("/organizaciones/nuevo", renderCrearOrganizacion);
router.post("/organizaciones", guardarOrganizacionDesdeVista);
router.get("/organizaciones/:id", validarId, renderOrganizacionDetalle);
router.get("/organizaciones/:id/editar", validarId, renderEditarOrganizacion);
router.post("/organizaciones/:id/editar", validarId, guardarEdicionOrganizacion);
router.get("/organizaciones/:id/eliminar", validarId, renderEliminarOrganizacion);
router.post("/organizaciones/:id/eliminar", validarId, eliminarOrganizacionVista);

router.get("/gastos", renderGastos);
router.get("/gastos/nuevo", renderCrearGasto);
router.post("/gastos", guardarGastoDesdeVista);

router.get("/donaciones", renderDonaciones);
router.get("/donaciones/nuevo", renderCrearDonacion);
router.post("/donaciones", guardarDonacionDesdeVista);
router.get("/donaciones/:id", validarId, renderDonacionDetalle);
router.get("/donaciones/:id/editar", validarId, renderEditarDonacion);
router.post("/donaciones/:id/editar", validarId, guardarEdicionDonacion);
router.get("/donaciones/:id/eliminar", validarId, renderEliminarDonacion);
router.post("/donaciones/:id/eliminar", validarId, eliminarDonacionVista);

router.get("/donantes", renderDonantes);
router.get("/donantes/nuevo", renderCrearDonante);
router.post("/donantes", guardarDonanteDesdeVista);

export default router;
