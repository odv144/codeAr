import express from "express";
import {
    obtenerGastos,
    obtenerGastoPorId,
    crearGasto,
    actualizarGasto,
    eliminarGasto
} from "../controllers/gastosController.js";
import { validarId } from "../middlewares/validarId.js";
import { validarBody } from "../middlewares/validarBody.js";
import { validarGasto } from "../middlewares/validarGasto.js";

const router = express.Router();

router.get("/", obtenerGastos);
router.get("/:id", validarId, obtenerGastoPorId);
router.post("/", validarBody, validarGasto, crearGasto);
router.put("/:id", validarId, validarBody, validarGasto, actualizarGasto);
router.delete("/:id", validarId, eliminarGasto);

export default router;