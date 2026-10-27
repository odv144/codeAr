import express from "express";
import { validarObjectId } from "../middlewares/validarObjectId.js";
import {
  listarDonantes,
  obtenerDonantePorId,
  crearDonante,
  modificarDonante,
  borrarDonante
} from "../controllers/donantesController.js"; // <-- Importante: no olvidar el .js al final
import { isAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Rutas CRUD para la API de Donantes
router.get("/", listarDonantes);
router.get("/:_id", validarObjectId, obtenerDonantePorId);
router.post("/", isAdmin, crearDonante);
router.put("/:_id", isAdmin, validarObjectId, modificarDonante);
router.delete("/:_id", isAdmin, validarObjectId, borrarDonante);
export default router;