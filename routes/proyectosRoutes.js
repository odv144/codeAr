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

const router = express.Router();

router.get("/", obtenerTodos);
router.get("/:id", obtenerProyectoPorId);
router.post("/", crearProyecto);
router.put("/:id", updateProyecto);
router.delete("/:id", deleteProyecto);
//router.get("/saldos/:id", obtenerSaldoProyectosActivos);// pruebas para obtener el saldo de proyectos activos
//router.post("/saldos", agregarSaldoAProyecto);//pruebas para agregar saldo a un proyecto
//router.get("/pruebas",obtenerProyectosBorrados);//pruebas para obtener proyectos borrados
export default router;
