import express from "express";
import {
    obtenerDonaciones,
    obtenerDonacionPorId,
    crearDonacion,
    actualizarDonacion,
    eliminarDonacion
} from "../controllers/donacionesController.js";
import { isAdmin } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", obtenerDonaciones);
router.get("/:id", obtenerDonacionPorId);
router.post("/", isAdmin, crearDonacion);
router.put("/:id", isAdmin, actualizarDonacion);
router.delete("/:id", isAdmin, eliminarDonacion);

export default router;
