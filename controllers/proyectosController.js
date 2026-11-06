import {
  obtenerProyectosId,
  insertarProyecto,
  obtenerProyectos,
  actualizarProyecto,
  eliminarProyecto,
  saldoProyectosActivos,
  proyectosBorrados,
} from "../services/serviceProyecto.js";
import { saldoIndividualProyecto } from "../services/saldoService.js";
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
// Saldo individual por proyecto: nunca un consolidado global.
const obtenerTodos = async (req, res, next) => {
  try {
    const proyectos = await obtenerProyectos({ incluirBajas: true });
    const proyectosConSaldo = await Promise.all(
      proyectos.map(async (p) => ({
        ...p,
        saldoActual: await saldoIndividualProyecto(p._id),
      })),
    );
    res.json(proyectosConSaldo);
  } catch (error) {
    next(error);
  }
};

// GET BY ID (incluye bajas: permite ver el detalle de un proyecto dado de baja)
const obtenerProyectoPorId = async (req, res, next) => {
  try {
    const proyecto = await obtenerProyectosId(req.params._id, { incluirBajas: true });
    const saldoActual = await saldoIndividualProyecto(proyecto._id);
    res.json({ ...proyecto.toObject(), saldoActual });
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

export {
  obtenerTodos,
  obtenerProyectoPorId,
  crearProyecto,
  updateProyecto,
  deleteProyecto,
  obtenerSaldoProyectosActivos,
  obtenerProyectosBorrados
};
