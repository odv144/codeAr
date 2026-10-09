import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Proyecto from "../models/Proyectos.js";
import mongoose from "mongoose";
import {
  obtenerProyectosId,
  insertarProyecto,
  obtenerProyectos,
  actualizarProyecto,
  eliminarProyecto,
  agregarSaldo,
  saldoProyectosActivos,
  proyectosBorrados,
} from "../services/serviceProyecto.js";

const __filename = fileURLToPath(import.meta.url);
//const __dirname = path.dirname(__filename);

//const rutaArchivo = path.join(__dirname, "../data/proyectos.json");

// función leer archivo
// const leerProyectos = () => {
//     const data = fs.readFileSync(rutaArchivo, "utf-8");

//     return JSON.parse(data);

// };
// función leer archivo desde MongoDB
// const leerProyectosMdb = async () => {
//     try {
//         return await obtenerDatos("proyectos");

//     } catch (error) {
//         console.error("Error al leer proyectos desde MongoDB:", error);
//         return [];
//     }
// };

// función guardar archivo
// const guardarProyectos = (proyectos) => {

//     fs.writeFileSync(
//         rutaArchivo,
//         JSON.stringify(proyectos, null, 2)
//     );

// };
//pruebas para obtener proyectos borrados
const obtenerProyectosBorrados = async (req, res) => {
  try {
    console.log("obteniendo proyectos borrados");  
    const proyectosBorrados = await proyectosBorrados();
    res.json(proyectosBorrados);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener los proyectos borrados" });
  }
};

// GET ALL
const obtenerTodos = async (req, res) => {
  try {
    const proyectos = await obtenerProyectos();
    res.json(proyectos);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener los proyectos" });
  }
};
// GET BY ID
const obtenerProyectoPorId = async (req, res) => {
  try {
    const id = req.params.id;
    const proyecto = await obtenerProyectosId(id);
    if (!proyecto) {
      return res.status(404).json({ mensaje: "Proyecto no encontrado" });
    }
    return res.json(proyecto);
  } catch (error) {
    return res.status(500).json({ mensaje: "Error al obtener el proyecto" });
  }
};
// saldos proyectos activos(para pruebas)
const obtenerSaldoProyectosActivos = async (req, res) => {
  try { 
    const totalSaldo = await saldoProyectosActivos(req.params.id);
    res.json({ totalSaldo });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener el total de saldo de proyectos activos" });
  }
};

//agregar saldo a un proyecto (para pruebas)
const agregarSaldoAProyecto = async (req, res) => {
  try {
  const { idProyecto, monto, fecha} = req.body;
  const fechaFinal = fecha ? new Date(fecha) : undefined;
  console.log("id a buscar:", idProyecto," monto a agregar:", monto);
    const proyectoActualizado = await agregarSaldo(idProyecto, monto, fechaFinal);
    res.json({ mensaje: "Saldo agregado correctamente", proyecto: proyectoActualizado });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al agregar saldo al proyecto" });
  }
};
// CREATE
const crearProyecto = async (req, res) => {
  try {
    const nuevoProyecto = await insertarProyecto(req.body);
    res.status(201).json({
      mensaje: "Proyecto creado exitosamente",
      proyecto: nuevoProyecto,
    });

  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear el proyecto" });
  }
};

// UPDATE
const updateProyecto = async (req, res) => {
  try {
    const proyecto = await actualizarProyecto(req.params.id, req.body);
    res.json({
      mensaje: "Proyecto actualizado",
      proyecto,
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar el proyecto aqui" });
  }
};

// DELETE
const deleteProyecto = async (req, res) => {
  try {
    const id = Number(req.params.id);
    console.log("id a buscar:", id);
    const proyecto = await eliminarProyecto(id);
    res.status(200).json({
      mensaje: "Proyecto eliminado correctamente",
      proyecto,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar el proyecto",
      error: error.message,
    });
  }
  //const tieneGastos = gastos.some((g) => Number(g.idProyecto) === id);
  //const tieneDonaciones = donaciones.some((d) => Number(d.idProyecto) === id);

  // if (tieneGastos || tieneDonaciones) {
  //   return res.status(409).json({
  //     mensaje:
  //       "No se puede eliminar el proyecto porque posee gastos o donaciones asociados",
  //   });
  // }

  // const nuevosProyectos = proyectos.filter((p) => p.idProyecto !== id);
  // guardarProyectos(nuevosProyectos);
};

export {
  obtenerTodos,
  obtenerProyectoPorId,
  crearProyecto,
  updateProyecto,
  deleteProyecto,
  agregarSaldoAProyecto,
  obtenerSaldoProyectosActivos,
  obtenerProyectosBorrados
};
