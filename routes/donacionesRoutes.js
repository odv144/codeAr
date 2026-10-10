import express from "express";
import {
    obtenerDonaciones,
    obtenerDonacionPorId,
    crearDonacion,
    actualizarDonacion,
    eliminarDonacion
} from "../controllers/donacionesController.js";
import { isAdmin } from "../middlewares/auth.js";
/*
import { validarId } from "../middlewares/validarId.js";
import { validarBody } from "../middlewares/validarBody.js";
import { validarDonacion } from "../middlewares/validarDonacion.js";
*/
const router = express.Router();

router.get("/", obtenerDonaciones);
router.get("/:id", obtenerDonacionPorId);
router.post("/", isAdmin, crearDonacion);
router.put("/:id", isAdmin, actualizarDonacion);
router.delete("/:id", isAdmin, eliminarDonacion);
/* ver que pasa con las validaciones
router.get("/:id", validarId, obtenerDonacionPorId);
router.post("/", validarBody, validarDonacion, crearDonacion);
router.put("/:id", validarId, validarBody, validarDonacion, actualizarDonacion);
router.delete("/:id", validarId, eliminarDonacion);
*/
export default router;