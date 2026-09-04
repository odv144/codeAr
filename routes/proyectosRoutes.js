const express = require("express");

const router = express.Router();

const {

    obtenerProyectos,
    obtenerProyectoPorId,
    crearProyecto,
    actualizarProyecto,
    eliminarProyecto

} = require("../controllers/proyectosController");

    
// rutas CRUD

router.get("/", obtenerProyectos);

router.get("/:id", obtenerProyectoPorId);

router.post("/", crearProyecto);

router.put("/:id", actualizarProyecto);

router.delete("/:id", eliminarProyecto);


module.exports = router;