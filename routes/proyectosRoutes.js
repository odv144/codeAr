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
import { validarObjectId } from "../middlewares/validarObjectId.js";
import { validarBody } from "../middlewares/validarBody.js";
import { validarProyecto } from "../middlewares/validaciones.js";

const router = express.Router();

router.get("/", obtenerTodos);
router.get("/:_id", validarObjectId, obtenerProyectoPorId);
router.post("/", isAdmin, validarBody, validarProyecto, crearProyecto);
router.put("/:_id", isAdmin, validarObjectId, validarBody, validarProyecto, updateProyecto);
router.delete("/:_id", isAdmin, validarObjectId, deleteProyecto);
//router.get("/saldos/:id", obtenerSaldoProyectosActivos);// pruebas para obtener el saldo de proyectos activos
//router.post("/saldos", agregarSaldoAProyecto);//pruebas para agregar saldo a un proyecto
//router.get("/pruebas",obtenerProyectosBorrados);//pruebas para obtener proyectos borrados
export default router;
