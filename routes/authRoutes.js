import express from "express";
import { mostrarLogin, login, logout } from "../controllers/authController.js";

const router = express.Router();

// Rutas de autenticación: no llevan isAuthenticated (son el ingreso y la salida).
router.get("/login", mostrarLogin);
router.post("/login", login);
router.get("/logout", logout);

export default router;
