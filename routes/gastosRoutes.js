import express from "express";
import {
    obtenerGastos,
    obtenerGastoPorId,
    crearGasto,
    actualizarGasto,
    eliminarGasto
} from "../controllers/gastosController.js";
import { isAdmin } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", obtenerGastos);
router.get("/:id", obtenerGastoPorId);
router.post("/", isAdmin, crearGasto);
router.put("/:id", isAdmin, actualizarGasto);
router.delete("/:id", isAdmin, eliminarGasto);

export default router;
