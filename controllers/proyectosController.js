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
import { AppError } from "../utils/AppError.js";

// Los servicios lanzan Errores simples sin status: acá se convierten en 404 real
// para que errorHandler muestre el mensaje y no un 500 genérico.
const mapearProyectoNoEncontrado = (error) =>
  error.message === "Proyecto no encontrado" ||
  error.message === "Proyecto dado de baja logica"
    ? new AppError(404, error.message)
    : error;

// pruebas para obtener proyectos borrados
const obtenerProyectosBorrados = async (req, res, next) => {
  try {
    const borrados = await proyectosBorrados();
    res.json(borrados);
  } catch (error) {
    next(error);
  }
};

// GET ALL
const obtenerTodos = async (req, res, next) => {
  try {
    const proyectos = await obtenerProyectos({ incluirBajas: true });
    res.json(proyectos);
  } catch (error) {
    next(error);
  }
};

// GET BY ID (incluye bajas: permite ver el detalle de un proyecto dado de baja)
const obtenerProyectoPorId = async (req, res, next) => {
  try {
    const proyecto = await obtenerProyectosId(req.params._id, { incluirBajas: true });
    res.json(proyecto);
  } catch (error) {
    next(mapearProyectoNoEncontrado(error));
  }
};

// saldos proyectos activos(para pruebas)
const obtenerSaldoProyectosActivos = async (req, res, next) => {
  try {
    const totalSaldo = await saldoProyectosActivos(req.params._id);
    res.json({ totalSaldo });
  } catch (error) {
    next(error);
  }
};

//agregar saldo a un proyecto (para pruebas)
const agregarSaldoAProyecto = async (req, res, next) => {
  try {
    const { idProyecto, monto, fecha } = req.body;
    const fechaFinal = fecha ? new Date(fecha) : undefined;
    const proyectoActualizado = await agregarSaldo(idProyecto, monto, fechaFinal);
    res.json({ mensaje: "Saldo agregado correctamente", proyecto: proyectoActualizado });
  } catch (error) {
    next(error);
  }
};

// CREATE
const crearProyecto = async (req, res, next) => {
  try {
    const nuevoProyecto = await insertarProyecto(req.datosProyecto);
    res.status(201).json({
      mensaje: "Proyecto creado exitosamente",
      proyecto: nuevoProyecto,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE
const updateProyecto = async (req, res, next) => {
  try {
    const proyecto = await actualizarProyecto(req.params._id, req.datosProyecto);
    res.json({
      mensaje: "Proyecto actualizado",
      proyecto,
    });
  } catch (error) {
    next(mapearProyectoNoEncontrado(error));
  }
};

// DELETE (baja lógica: no borra el documento, lo marca como inactivo)
const deleteProyecto = async (req, res, next) => {
  try {
    const proyecto = await eliminarProyecto(req.params._id);
    res.status(200).json({
      mensaje: "Proyecto dado de baja correctamente",
      proyecto,
    });
  } catch (error) {
    next(error.statusCode === 404
      ? new AppError(404, "Proyecto no encontrado")
      : error);
  }
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
