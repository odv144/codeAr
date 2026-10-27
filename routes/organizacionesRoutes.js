import express from "express";
import {
    obtenerOrganizaciones,
    obtenerOrganizacionPorId,
    crearOrganizacion,
    actualizarOrganizacion,
    darDeBajaOrganizacion,
    reactivarOrganizacion
} from "../controllers/organizacionesController.js";
import { validarObjectId } from "../middlewares/validarObjectId.js";
import { validarBody } from "../middlewares/validarBody.js";
import { validarOrganizacion } from "../middlewares/validaciones.js";
import { isAdmin } from "../middlewares/auth.js";


const router = express.Router();

// Cada ruta pasa por sus middlewares de validación antes de llegar al controlador.
// :_id es el _id (ObjectId) de MongoDB.
router.get("/", obtenerOrganizaciones);
router.get("/:_id", validarObjectId, obtenerOrganizacionPorId);
router.post("/", isAdmin, validarBody, validarOrganizacion, crearOrganizacion);
router.put("/:_id", isAdmin, validarObjectId, validarBody, validarOrganizacion, actualizarOrganizacion);
// DELETE hace una baja lógica (marca la organización como inactiva)
router.delete("/:_id", isAdmin, validarObjectId, darDeBajaOrganizacion);
// PATCH reactiva una organización dada de baja
router.patch("/:_id/reactivar", isAdmin, validarObjectId, reactivarOrganizacion);

export default router;