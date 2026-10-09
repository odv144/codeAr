import express from "express";
import {
    obtenerOrganizaciones,
    obtenerOrganizacionPorId,
    crearOrganizacion,
    actualizarOrganizacion,
    darDeBajaOrganizacion,
    reactivarOrganizacion
} from "../controllers/organizacionesController.js";
import { validarId } from "../middlewares/validarId.js";
import { validarBody } from "../middlewares/validarBody.js";
import { validarOrganizacion } from "../middlewares/validarOrganizacion.js";
import { isAdmin } from "../middlewares/auth.js";


const router = express.Router();

// Cada ruta pasa por sus middlewares de validación antes de llegar al controlador
router.get("/", obtenerOrganizaciones);
router.get("/:id", validarId, obtenerOrganizacionPorId);
router.post("/", isAdmin, validarBody, validarOrganizacion, crearOrganizacion);
router.put("/:id", isAdmin, validarId, validarBody, validarOrganizacion, actualizarOrganizacion);
// DELETE hace una baja lógica (marca la organización como inactiva)
router.delete("/:id", isAdmin, validarId, darDeBajaOrganizacion);
// PATCH reactiva una organización dada de baja
router.patch("/:id/reactivar", isAdmin, validarId, reactivarOrganizacion);

export default router;
