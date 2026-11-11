import { isValidObjectId } from "mongoose";
import Proyecto from "../models/Proyectos.js";
import { obtenerOrganizacionPorId } from "./serviceOrganizacion.js";
import { AppError } from "../utils/AppError.js";
import { saldoIndividualProyecto } from "./saldoService.js";

const SOLO_ACTIVAS = { activa: { $ne: false } };
//Servicio para obtener un proyecto por su ID desde la base de datos MongoDB

async function obtenerProyectos({ incluirBajas = false } = {}) {
  const filtro = incluirBajas ? {} : SOLO_ACTIVAS;
  return Proyecto.find(filtro).lean();
}

async function proyectosBorrados(){
  return Proyecto.find({ activa: false }).lean();
}

//Servicio para obtener un proyecto por su ID desde la base de datos MongoDB.
// Por defecto solo devuelve proyectos activos; con incluirBajas también los
// dados de baja (para ver su detalle y poder reactivarlos).
async function obtenerProyectosId(id, { incluirBajas = false } = {}) {
  try {
    const proyecto = await Proyecto.findById(id);
    if (!proyecto) {
      throw new Error("Proyecto no encontrado");
    }
    if (!incluirBajas && !proyecto.activa) {
      throw new Error("Proyecto dado de baja logica");
    }
    return proyecto;
  } catch (error) {
    console.error("Error al obtener el proyecto por ID:", error);
    throw error;
  }
}

//funcion para insertar datos en la base de datos y se manda por parametro la tabla y los datos a insertar
async function insertarProyecto(datos) {
  const { idOrganizacion, nomProyecto, descripcion } = datos;
  
  if (!idOrganizacion || !nomProyecto || !descripcion) {
    const err = new Error("Faltan campos obligatorios");
    err.status = 400;
    throw err;
  }
  if (!isValidObjectId(idOrganizacion)) {
    const err = new Error("La organización indicada no es un _id válido de MongoDB");
    err.status = 400;
    throw err;
  }
  // Verificar que haya conexión
  if (Proyecto.db.readyState !== 1) {
    throw new Error("MongoDB no está conectado (readyState !== 1)");
  }
  const organizacionExiste = await obtenerOrganizacionPorId(idOrganizacion);
  if (!organizacionExiste) {
    const err = new Error("La organización no existe o está dada de baja");
    err.status = 400;
    throw err;
  }

  const nuevo = await Proyecto.create({
    idOrganizacion,
    nomProyecto: String(nomProyecto).trim(),
    descripcion: String(descripcion).trim(),
  });
 
  return nuevo.toObject();
}

//Funcion para actualizar un proyecto por su ID en la base de datos MongoDB
async function actualizarProyecto(id, datos) {
  try {
    // 1) Solo campos permitidos (evita que manden idProyecto, _id, etc.)
    const permitidos = [
      "idOrganizacion",
      "nomProyecto",
      "descripcion",
    ];
    const update = {};

    for (const campo of permitidos) {
      if (
        datos[campo] !== undefined &&
        datos[campo] !== null &&
        datos[campo] !== ""
      ) {
        update[campo] = datos[campo];
      }
    }

    // 2) Si no hay nada para actualizar
    if (Object.keys(update).length === 0) {
      const err = new Error("No se enviaron datos para actualizar");
      err.status = 400;
      throw err;
    }

    // 3) Normalizar tipos según el schema
    if (!isValidObjectId(update.idOrganizacion)) {
      const err = new Error("idOrganizacion debe ser un _id válido de MongoDB");
      err.status = 400;
      throw err;
    }
    
    if (update.nomProyecto !== undefined) {
      update.nomProyecto = String(update.nomProyecto).trim();
    }

    if (update.descripcion !== undefined) {
      update.descripcion = String(update.descripcion).trim();
    }

    // 4) Update con validación del schema
    const proyecto = await Proyecto.findOneAndUpdate(
      { _id: id },
      { $set: update }, // $set = solo toca esos campos
      { returnDocument: "after", runValidators: true },
    );

    if (!proyecto) {
      const err = new Error("Proyecto no encontrado");
      err.status = 404;
      throw err;
    }

    return proyecto;
  } catch (error) {
    // Errores de validación de Mongoose
    if (error.name === "ValidationError") {
      error.status = 400;
    }
    console.error(
      "Error al actualizar el proyecto: pero llega al servicio",
      error,
    );
    throw error;
  }
}
//Funcion para eliminar un proyecto por su ID en la base de datos MongoDB
// Baja lógica: solo si el saldo actual es 0 (si no, 409).
async function eliminarProyecto(id) {
  try {
    const existeActivo = await Proyecto.exists({ _id: id, ...SOLO_ACTIVAS });
    if (!existeActivo) {
      const error = new Error("Proyecto no encontrado");
      error.statusCode = 404;
      throw error;
    }

    const saldo = await saldoIndividualProyecto(id);
    if (saldo > 0) {
      throw new AppError(409, "El proyecto tiene saldo remanente: no se puede dar de baja");
    }

    const proyecto = await Proyecto.findOneAndUpdate(
      { _id:id, ...SOLO_ACTIVAS },
      { $set: { activa: false, fechaBaja: new Date() } },
      { returnDocument: "after" },
    );

    if (!proyecto) {
      const error = new Error("Proyecto no encontrado");
      error.statusCode = 404;
      throw error;
    }

    return proyecto;
  } catch (error) {
    console.error("Error al eliminar el proyecto:", error);
    throw error;
  }
}
async function reactivarProyectos(_id) {
  const existente = await Proyecto.findById(_id)
    .select("activa")
    .lean();
  if (!existente) return null;

  if (existente.activa !== false) {
    throw new AppError(409, "El proyecto ya está activo");
  }

  const reactivada = await Proyecto.findOneAndUpdate(
    { _id, activa: false },
    { $set: { activa: true, fechaBaja: null } },
    { returnDocument: "after" },
  );
  return reactivada;
}
// Saldo de un proyecto activo: exige _id válido (si no, 0) y delega en
// saldoIndividualProyecto (filtro estricto por ObjectId).
async function saldoProyectosActivos(_id) {
  try {
    if (!isValidObjectId(_id)) {
      return 0;
    }
    const existeActivo = await Proyecto.exists({
      _id,
      activa: { $ne: false },
    });
    if (!existeActivo) {
      return 0;
    }
    return await saldoIndividualProyecto(_id);
  } catch (error) {
    console.error(
      "Error al obtener el saldo del proyecto activo:",
      error,
    );
    throw error;
  }
}

export {
  obtenerProyectosId,
  insertarProyecto,
  obtenerProyectos,
  actualizarProyecto,
  eliminarProyecto,
  reactivarProyectos,
  saldoProyectosActivos,
  proyectosBorrados
};
