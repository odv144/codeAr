import { connectDB } from "../config/db.js";
import mongoose from "mongoose";
import Proyecto from "../models/Proyectos.js";
import { existeOrganizacion } from "./serviceOrganizacion.js";

const SOLO_ACTIVAS = { activa: { $ne: false } };
//Servicio para obtener un proyecto por su ID desde la base de datos MongoDB

async function obtenerProyectos() {
  try {
    const proyectos = await Proyecto.find({ ...SOLO_ACTIVAS }).lean();
    return proyectos;
  } catch (error) {
    console.error("Error al obtener los proyectos:", error);
  } 
}

async function proyectosBorrados(){
  try {
    const proyectosBorrados = await Proyecto.find({ activa: false }).lean();
    console.log("Proyectos borrados encontrados:", proyectosBorrados);
    return proyectosBorrados;
  } catch (error) {
    console.error("Error al obtener los proyectos borrados:", error);
  }
}

//Servicio para obtener un proyecto por su ID desde la base de datos MongoDB
async function obtenerProyectosId(id) {
  try {
    const proyecto = await Proyecto.findOne({ idProyecto: Number(id) });
    if (!proyecto) {
      throw new Error("Proyecto no encontrado");
    }
    if (!proyecto.activa) {
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
  const { idOrganizacion, nomProyecto, descripcion, saldo } = datos;

  if (!idOrganizacion || !nomProyecto || !descripcion) {
    const err = new Error("Faltan campos obligatorios");
    err.status = 400;
    throw err;
  }
  if (typeof saldo !== "number" && saldo < 0) {
    const err = new Error(
      "El campo saldo debe ser un número mayor o igual a cero",
    );
    err.status = 400;
    throw err;
  }
  // Verificar que haya conexión
  if (Proyecto.db.readyState !== 1) {
    throw new Error("MongoDB no está conectado (readyState !== 1)");
  }
  const idOrg = await existeOrganizacion(idOrganizacion);
  if (!idOrg) {
    const err = new Error("La organización no existe o está dada de baja");
    err.status = 400;
    throw err;
  }
  const ultimo = await Proyecto.findOne()
    .sort({ idProyecto: -1 })
    .select("idProyecto")
    .lean();

  const idProyecto = ultimo ? ultimo.idProyecto + 1 : 1;
  const nuevo = await Proyecto.create({
    idProyecto,
    idOrganizacion: Number(idOrg),
    nomProyecto: String(nomProyecto).trim(),
    descripcion: String(descripcion).trim(),
    saldo: [{ monto: Number(saldo) || 0, fecha: new Date() }],
  });
  return nuevo.toObject();
}

async function agregarSaldo(id, monto, fecha = new Date()) {
  try {
    // Validaciones básicas
    if (!id) {
      throw new Error("El idProyecto es obligatorio");
    }
    if (monto === undefined || monto === null || isNaN(monto)) {
      throw new Error("El monto debe ser un número válido");
    }
    const proyecto = await Proyecto.findOneAndUpdate(
      {
        idProyecto: id,
        activa: true, // solo permite agregar saldo a proyectos activos
      },
      {
        $push: {
          saldo: {
            monto: Number(monto),
            fecha: fecha , 
          },
        },
      },
      {
        returnDocument: "after", // devuelve el documento ya actualizado
        runValidators: true,
      },
    );
    if (!proyecto) {
      throw new Error(
        `No se encontró un proyecto activo con idProyecto: ${id}`,
      );
    }
    return proyecto;
  } catch (error) {
    console.error("Error al agregar saldo:", error.message);
    throw error;
  }
}
//Funcion para actualizar un proyecto por su ID en la base de datos MongoDB
async function actualizarProyecto(id, datos) {
  try {
    // 1) Solo campos permitidos (evita que manden idProyecto, _id, etc.)
    const permitidos = [
      "idOrganizacion",
      "nomProyecto",
      "descripcion",
      "saldo",
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
    if (update.idOrganizacion !== undefined) {
      update.idOrganizacion = Number(update.idOrganizacion);
      if (Number.isNaN(update.idOrganizacion)) {
        const err = new Error("idOrganizacion debe ser un número");
        err.status = 400;
        throw err;
      }
    }

    if (update.nomProyecto !== undefined) {
      update.nomProyecto = String(update.nomProyecto).trim();
    }

    if (update.descripcion !== undefined) {
      update.descripcion = String(update.descripcion).trim();
    }

    // saldo: si te llega un número, lo convertís al formato del schema
    if (update.saldo !== undefined) {
      if (
        typeof update.saldo === "number" ||
        typeof update.saldo === "string"
      ) {
        update.saldo = [
          { monto: Number(update.saldo) || 0, fecha: new Date() },
        ];
      }
      // si ya viene como array [{ monto, fecha }], lo dejás igual
    }

    // 4) Update con validación del schema
    const proyecto = await Proyecto.findOneAndUpdate(
      { idProyecto: Number(id) },
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
async function eliminarProyecto(id) {
  try {
    const proyecto = await Proyecto.findOneAndUpdate(
      { idProyecto: Number(id), ...SOLO_ACTIVAS },
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
async function reactivarProyectos(id) {
  const idNumerico = Number(id);

  const existente = await Proyecto.findOne({ idProyecto: idNumerico })
    .select("activa")
    .lean();
  if (!existente) return null;

  if (existente.activa !== false) {
    throw new AppError(409, "El proyecto ya está activo");
  }

  const reactivada = await Proyecto.findOneAndUpdate(
    { idProyecto: idNumerico, activa: false },
    { $set: { activa: true, fechaBaja: null } },
    { returnDocument: "after" },
  );
  return reactivada;
}
//obtener total de saldo de todos los proyectos activos
async function saldoProyectosActivos(id) {
  try {
    const filtro = { activa: true };
    if (id) {
      filtro.idProyecto = Number(id);
    }
    const proyectosActivos = await Proyecto.find(filtro).select("saldo");
    console.log("Proyectos activos encontrados:", proyectosActivos);
    // 3. Sumá de forma segura
    const totalSaldo = proyectosActivos.reduce((total, proyecto) => {
      // Protección por si saldo no es un array
      if (!Array.isArray(proyecto.saldo)) {
        console.warn("saldo no es array en el proyecto:", proyecto._id);
        return total;
      }

      const saldoProyecto = proyecto.saldo.reduce((acc, item) => {
        // Protección por si item.monto no existe o no es número
        const monto = Number(item?.monto) || 0;
        return acc + monto;
      }, 0);

      return total + saldoProyecto;
    }, 0);

    return totalSaldo;
  } catch (error) {
    console.error(
      "Error al obtener el total de saldo de proyectos activos:",
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
  agregarSaldo,
  saldoProyectosActivos,
  proyectosBorrados
};
