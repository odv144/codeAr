const fs = require("fs");
const path = require("path");

const Proyecto = require("../models/Proyectos");

const rutaArchivo = path.join(__dirname, "../data/proyectos.json");


// función leer archivo
const leerProyectos = () => {
    const data = fs.readFileSync(rutaArchivo, "utf-8");

    return JSON.parse(data);

};


// función guardar archivo
const guardarProyectos = (proyectos) => {

    fs.writeFileSync(
        rutaArchivo,
        JSON.stringify(proyectos, null, 2)
    );

};


// GET ALL
const obtenerProyectos = (req, res) => {

    const proyectos = leerProyectos();

    res.json(proyectos);

};


// GET BY ID
const obtenerProyectoPorId = (req, res) => {

    const proyectos = leerProyectos();

    const id = parseInt(req.params.id);

    const proyecto = proyectos.find(p => p.id === id);

    if (!proyecto) {

        return res.status(404).json({
            mensaje: "Proyecto no encontrado"
        });

    }

    res.json(proyecto);

};


// CREATE
const crearProyecto = (req, res) => {

    const proyectos = leerProyectos();

    const { id, nombre, descripcion } = req.body;

    const nuevoProyecto = new Proyecto(id, nombre, descripcion);

    proyectos.push(nuevoProyecto);

    guardarProyectos(proyectos);

    res.status(201).json({
        mensaje: "Proyecto creado",
        proyecto: nuevoProyecto
    });

};


// UPDATE
const actualizarProyecto = (req, res) => {

    const proyectos = leerProyectos();

    const id = parseInt(req.params.id);

    const proyecto = proyectos.find(p => p.id === id);

    if (!proyecto) {

        return res.status(404).json({
            mensaje: "Proyecto no encontrado"
        });

    }

    const { nombre, descripcion } = req.body;

    proyecto.nombre = nombre ?? proyecto.nombre;
    proyecto.descripcion = descripcion ?? proyecto.descripcion;

    guardarProyectos(proyectos);

    res.json({
        mensaje: "Proyecto actualizado",
        proyecto
    });

};


// DELETE
const eliminarProyecto = (req, res) => {

    const proyectos = leerProyectos();

    const id = parseInt(req.params.id);

    const nuevosProyectos = proyectos.filter(p => p.id !== id);

    if (proyectos.length === nuevosProyectos.length) {

        return res.status(404).json({
            mensaje: "Proyecto no encontrado"
        });

    }

    guardarProyectos(nuevosProyectos);

    res.json({
        mensaje: "Proyecto eliminado"
    });

};


module.exports = {

    obtenerProyectos,
    obtenerProyectoPorId,
    crearProyecto,
    actualizarProyecto,
    eliminarProyecto

};