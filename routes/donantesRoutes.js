import express from "express";
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
router.get("/:id", obtenerDonantePorId);
router.post("/", isAdmin, crearDonante);
router.put("/:id", isAdmin, modificarDonante);
router.delete("/:id", isAdmin, borrarDonante);

export default router;