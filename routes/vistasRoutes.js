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
    renderReactivarProyecto,
    reactivarProyectoVista,
    renderOrganizaciones,
    renderCrearOrganizacion,
    guardarOrganizacionDesdeVista,
    renderOrganizacionDetalle,
    renderEditarOrganizacion,
    guardarEdicionOrganizacion,
    renderEliminarOrganizacion,
    eliminarOrganizacionVista,
    renderReactivarOrganizacion,
    reactivarOrganizacionVista,
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
import { validarObjectId } from "../middlewares/validarObjectId.js";
import { isAdmin, isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", renderHome);

// PROYECTOS (identificados por el _id de MongoDB; eliminar = baja lógica, reactivar la revierte)
router.get("/proyectos", renderProyectos);
router.get("/proyectos/nuevo", isAdmin, renderCrearProyecto);
router.post("/proyectos", isAdmin, guardarProyectoDesdeVista);
router.get("/proyectos/:_id", validarObjectId, renderProyectoDetalle);
router.get("/proyectos/:_id/editar", isAdmin, validarObjectId, renderEditarProyecto);
router.post("/proyectos/:_id/editar", isAdmin, validarObjectId, guardarEdicionProyecto);
router.get("/proyectos/:_id/eliminar", isAdmin, validarObjectId, renderEliminarProyecto);
router.post("/proyectos/:_id/eliminar", isAdmin, validarObjectId, eliminarProyectoVista);
router.get("/proyectos/:_id/reactivar", isAdmin, validarObjectId, renderReactivarProyecto);
router.post("/proyectos/:_id/reactivar", isAdmin, validarObjectId, reactivarProyectoVista);

// ORGANIZACIONES (se identifican por el _id de MongoDB (:_id); eliminar = baja lógica, reactivar la revierte)
router.get("/organizaciones", renderOrganizaciones);
router.get("/organizaciones/nuevo", isAdmin, renderCrearOrganizacion);
router.post("/organizaciones", isAdmin, guardarOrganizacionDesdeVista);
router.get("/organizaciones/:_id", validarObjectId, renderOrganizacionDetalle);
router.get("/organizaciones/:_id/editar", isAdmin, validarObjectId, renderEditarOrganizacion);
router.post("/organizaciones/:_id/editar", isAdmin, validarObjectId, guardarEdicionOrganizacion);
router.get("/organizaciones/:_id/eliminar", isAdmin, validarObjectId, renderEliminarOrganizacion);
router.post("/organizaciones/:_id/eliminar", isAdmin, validarObjectId, eliminarOrganizacionVista);
router.get("/organizaciones/:_id/reactivar", isAdmin, validarObjectId, renderReactivarOrganizacion);
router.post("/organizaciones/:_id/reactivar", isAdmin, validarObjectId, reactivarOrganizacionVista);

router.get("/gastos", renderGastos);
router.get("/gastos/nuevo", isAdmin, renderCrearGasto);
router.post("/gastos", isAdmin, guardarGastoDesdeVista);
// Detalle (autenticado) y ciclo de edición/baja (solo admin).
// POST /vistas/gastos redirige al listado; el detalle accesible por :_id
router.get("/gastos/:_id", isAuthenticated, validarObjectId, renderGastoDetalle);
router.get("/gastos/:_id/editar", isAdmin, validarObjectId, renderGastoEditar);
router.post("/gastos/:_id/editar", isAdmin, validarObjectId, guardarEdicionGasto);
router.get("/gastos/:_id/eliminar", isAdmin, validarObjectId, renderGastoEliminar);
router.post("/gastos/:_id/eliminar", isAdmin, validarObjectId, eliminarGastoVista);

router.get("/donaciones", renderDonaciones);
router.get("/donaciones/nuevo", isAdmin, renderCrearDonacion);
router.post("/donaciones", isAdmin, guardarDonacionDesdeVista);
router.get("/donaciones/:_id", isAuthenticated, validarObjectId, renderDonacionDetalle);
router.get("/donaciones/:_id/editar", isAdmin, validarObjectId, renderEditarDonacion);
router.post("/donaciones/:_id/editar", isAdmin, validarObjectId, guardarEdicionDonacion);
router.get("/donaciones/:_id/eliminar", isAdmin, validarObjectId, renderEliminarDonacion);
router.post("/donaciones/:_id/eliminar", isAdmin, validarObjectId, eliminarDonacionVista);

router.get("/donantes", renderDonantes);
router.get("/donantes/nuevo", isAdmin, renderCrearDonante);
router.post("/donantes", isAdmin, guardarDonanteDesdeVista);
// Detalle (autenticado) y ciclo de edición/baja (solo admin). Borrado físico,
// el mismo criterio que DELETE /donantes/:id
router.get("/donantes/:_id", isAuthenticated, validarObjectId, renderDonanteDetalle);
router.get("/donantes/:_id/editar", isAdmin, validarObjectId, renderDonanteEditar);
router.post("/donantes/:_id/editar", isAdmin, validarObjectId, guardarEdicionDonante);
router.get("/donantes/:_id/eliminar", isAdmin, validarObjectId, renderDonanteEliminar);
router.post("/donantes/:_id/eliminar", isAdmin, validarObjectId, eliminarDonanteVista);
export default router;
