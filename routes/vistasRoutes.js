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
    renderGastoDetalle,
    renderGastoEditar,
    guardarEdicionGasto,
    renderGastoEliminar,
    eliminarGastoVista,
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
    guardarDonanteDesdeVista,
    renderDonanteDetalle,
    renderDonanteEditar,
    guardarEdicionDonante,
    renderDonanteEliminar,
    eliminarDonanteVista
} from "../controllers/vistasController.js";
import { validarId } from "../middlewares/validarId.js";
import { isAdmin, isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", renderHome);

// PROYECTOS (IDs numéricos: idProyecto)
router.get("/proyectos", renderProyectos);
router.get("/proyectos/nuevo", isAdmin, renderCrearProyecto);
router.post("/proyectos", isAdmin, guardarProyectoDesdeVista);
router.get("/proyectos/:id", validarId, renderProyectoDetalle);
router.get("/proyectos/:id/editar", isAdmin, validarId, renderEditarProyecto);
router.post("/proyectos/:id/editar", isAdmin, validarId, guardarEdicionProyecto);
router.get("/proyectos/:id/eliminar", isAdmin, validarId, renderEliminarProyecto);
router.post("/proyectos/:id/eliminar", isAdmin, validarId, eliminarProyectoVista);

// ORGANIZACIONES (IDs numéricos: idOrganizacion, eliminar = baja lógica)
router.get("/organizaciones", renderOrganizaciones);
router.get("/organizaciones/nuevo", isAdmin, renderCrearOrganizacion);
router.post("/organizaciones", isAdmin, guardarOrganizacionDesdeVista);
router.get("/organizaciones/:id", validarId, renderOrganizacionDetalle);
router.get("/organizaciones/:id/editar", isAdmin, validarId, renderEditarOrganizacion);
router.post("/organizaciones/:id/editar", isAdmin, validarId, guardarEdicionOrganizacion);
router.get("/organizaciones/:id/eliminar", isAdmin, validarId, renderEliminarOrganizacion);
router.post("/organizaciones/:id/eliminar", isAdmin, validarId, eliminarOrganizacionVista);

router.get("/gastos", renderGastos);
router.get("/gastos/nuevo", isAdmin, renderCrearGasto);
router.post("/gastos", isAdmin, guardarGastoDesdeVista);
// Detalle (autenticado) y ciclo de edición/baja (solo admin).
// POST /vistas/gastos redirige al listado; el detalle accesible por :id
router.get("/gastos/:id", isAuthenticated, validarId, renderGastoDetalle);
router.get("/gastos/:id/editar", isAdmin, validarId, renderGastoEditar);
router.post("/gastos/:id/editar", isAdmin, validarId, guardarEdicionGasto);
router.get("/gastos/:id/eliminar", isAdmin, validarId, renderGastoEliminar);
router.post("/gastos/:id/eliminar", isAdmin, validarId, eliminarGastoVista);

router.get("/donaciones", renderDonaciones);
router.get("/donaciones/nuevo", isAdmin, renderCrearDonacion);
router.post("/donaciones", isAdmin, guardarDonacionDesdeVista);
//router.get("/donaciones/nuevo", renderCrearDonacion);
//router.post("/donaciones", guardarDonacionDesdeVista);
router.get("/donaciones/:id", validarId, renderDonacionDetalle);
router.get("/donaciones/:id/editar", validarId, renderEditarDonacion);
router.post("/donaciones/:id/editar", validarId, guardarEdicionDonacion);
router.get("/donaciones/:id/eliminar", validarId, renderEliminarDonacion);
router.post("/donaciones/:id/eliminar", validarId, eliminarDonacionVista);

router.get("/donantes", renderDonantes);
router.get("/donantes/nuevo", isAdmin, renderCrearDonante);
router.post("/donantes", isAdmin, guardarDonanteDesdeVista);
// Detalle (autenticado) y ciclo de edición/baja (solo admin). Borrado físico,
// el mismo criterio que DELETE /donantes/:id
router.get("/donantes/:id", isAuthenticated, validarId, renderDonanteDetalle);
router.get("/donantes/:id/editar", isAdmin, validarId, renderDonanteEditar);
router.post("/donantes/:id/editar", isAdmin, validarId, guardarEdicionDonante);
router.get("/donantes/:id/eliminar", isAdmin, validarId, renderDonanteEliminar);
router.post("/donantes/:id/eliminar", isAdmin, validarId, eliminarDonanteVista);

export default router;
