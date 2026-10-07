import express from "express";
import {
  listarDonantes,
  obtenerDonantePorId,
  crearDonante,
  modificarDonante,
  borrarDonante
} from "../controllers/donantesController.js"; // <-- Importante: no olvidar el .js al final

const router = express.Router();

// Rutas CRUD para la API de Donantes
router.get("/", listarDonantes);
router.get("/:id", obtenerDonantePorId);
router.post("/", crearDonante);
router.put("/:id", modificarDonante);
router.delete("/:id", borrarDonante);

export default router;