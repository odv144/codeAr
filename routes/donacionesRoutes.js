import express from "express";
import {
    obtenerDonaciones,
    obtenerDonacionPorId,
    crearDonacion,
    actualizarDonacion,
    eliminarDonacion
} from "../controllers/donacionesController.js";
import { validarId } from "../middlewares/validarId.js";
import { validarBody } from "../middlewares/validarBody.js";
import { validarDonacion } from "../middlewares/validarDonacion.js";

const router = express.Router();

router.get("/", obtenerDonaciones);
router.get("/:id", validarId, obtenerDonacionPorId);
router.post("/", validarBody, validarDonacion, crearDonacion);
router.put("/:id", validarId, validarBody, validarDonacion, actualizarDonacion);
router.delete("/:id", validarId, eliminarDonacion);

export default router;