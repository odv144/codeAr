import express from "express";
import {
    obtenerTodos,
    obtenerProyectoPorId,
    crearProyecto,
    updateProyecto,
    deleteProyecto,
    agregarSaldoAProyecto,
    obtenerSaldoProyectosActivos,
    obtenerProyectosBorrados
} from "../controllers/proyectosController.js";
import { isAdmin } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", obtenerTodos);
router.get("/:id", obtenerProyectoPorId);
router.post("/", isAdmin, crearProyecto);
router.put("/:id", isAdmin, updateProyecto);
router.delete("/:id", isAdmin, deleteProyecto);
//router.get("/saldos/:id", obtenerSaldoProyectosActivos);// pruebas para obtener el saldo de proyectos activos
//router.post("/saldos", agregarSaldoAProyecto);//pruebas para agregar saldo a un proyecto
//router.get("/pruebas",obtenerProyectosBorrados);//pruebas para obtener proyectos borrados
export default router;
