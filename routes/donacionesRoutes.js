import express from "express";
import {
    obtenerDonaciones,
    obtenerDonacionPorId,
    crearDonacion,
    actualizarDonacion,
    eliminarDonacion
} from "../controllers/donacionesController.js";
import { isAdmin } from "../middlewares/auth.js";
import { validarObjectId } from "../middlewares/validarObjectId.js";
import { validarBody } from "../middlewares/validarBody.js";
import { validarDonacion } from "../middlewares/validaciones.js";

const router = express.Router();

router.get("/", obtenerDonaciones);
router.get("/:_id", validarObjectId, obtenerDonacionPorId);
router.post("/", isAdmin, validarBody, validarDonacion, crearDonacion);
router.put("/:_id", isAdmin, validarObjectId, validarBody, validarDonacion, actualizarDonacion);
router.delete("/:_id", isAdmin, validarObjectId, eliminarDonacion);

export default router;