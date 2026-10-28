import express from "express";
import { mostrarLogin, mostrarRegistro, registrar, login, logout } from "../controllers/authController.js";

const router = express.Router();

// Rutas de autenticación
router.get("/login", mostrarLogin);
router.post("/login", login);
router.get("/logout", logout);

router.get("/vistas/registro", mostrarRegistro);
router.post("/vistas/registro", registrar);
router.get("/registro", mostrarRegistro);
router.post("/registro", registrar);

export default router;
