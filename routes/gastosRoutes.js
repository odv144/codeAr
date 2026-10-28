import express from "express";
import {
    obtenerGastos,
    obtenerGastoPorId,
    crearGasto,
    actualizarGasto,
    eliminarGasto
} from "../controllers/gastosController.js";
import { isAdmin } from "../middlewares/auth.js";
import { validarObjectId } from "../middlewares/validarObjectId.js";
import { validarBody } from "../middlewares/validarBody.js";
import { validarGasto } from "../middlewares/validaciones.js";

const router = express.Router();

router.get("/", obtenerGastos);
router.get("/:_id", validarObjectId, obtenerGastoPorId);
router.post("/", isAdmin, validarBody, validarGasto, crearGasto);
router.put("/:_id", isAdmin, validarObjectId, validarBody, validarGasto, actualizarGasto);
router.delete("/:_id", isAdmin, validarObjectId, eliminarGasto);

export default router;