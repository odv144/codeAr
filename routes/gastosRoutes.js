import express from "express";
import {
    obtenerGastos,
    obtenerGastoPorId,
    crearGasto,
    actualizarGasto,
    eliminarGasto
} from "../controllers/gastosController.js";
import { isAdmin } from "../middlewares/auth.js";
import { validarId } from "../middlewares/validarId.js";
import { validarBody } from "../middlewares/validarBody.js";
import { validarGasto } from "../middlewares/validarGasto.js";

const router = express.Router();

router.get("/", obtenerGastos);
router.get("/:id", validarId, obtenerGastoPorId);
router.post("/", isAdmin, validarBody, validarGasto, crearGasto);
router.put("/:id", isAdmin, validarId, validarBody, validarGasto, actualizarGasto);
router.delete("/:id", isAdmin, validarId, eliminarGasto);

export default router;