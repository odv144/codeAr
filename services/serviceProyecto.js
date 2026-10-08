import { connectDB } from "../config/db.js";
import mongoose from "mongoose";
import Proyecto from "../models/Proyectos.js";

//Servicio para obtener un proyecto por su ID desde la base de datos MongoDB
async function obtenerProyectos() {
  try {
    const proyectos = await Proyecto.find();
        return proyectos;
  } catch (error) {
    console.error("Error al obtener los proyectos:", error);
  } finally {
    //await mongoose.disconnect();
  }
}

//Servicio para obtener un proyecto por su ID desde la base de datos MongoDB
async function obtenerProyectosId(id) {
  try {
       const proyecto = await Proyecto.findOne({ idProyecto: Number(id) });
    if (!proyecto) {
      throw new Error("Proyecto no encontrado");
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

  // Verificar que haya conexión
  if (Proyecto.db.readyState !== 1) {
    throw new Error("MongoDB no está conectado (readyState !== 1)");
  }

  const ultimo = await Proyecto.findOne()
    .sort({ idProyecto: -1 })
    .select("idProyecto")
    .lean();

  const idProyecto = ultimo ? ultimo.idProyecto + 1 : 1;

  const nuevo = await Proyecto.create({
    idProyecto,
    idOrganizacion: Number(idOrganizacion),
    nomProyecto: String(nomProyecto).trim(),
    descripcion: String(descripcion).trim(),
    saldo: [{ monto: Number(saldo) || 0, fecha: new Date() }],
  });

  console.log("Proyecto guardado:", nuevo._id, "idProyecto:", nuevo.idProyecto);
  return nuevo.toObject();
}


//Funcion para actualizar un proyecto por su ID en la base de datos MongoDB
async function actualizarProyecto(id, datos) {
 try {
    // 1) Solo campos permitidos (evita que manden idProyecto, _id, etc.)
    const permitidos = ["idOrganizacion", "nomProyecto", "descripcion", "saldo"];
    const update = {};

    for (const campo of permitidos) {
      if (datos[campo] !== undefined && datos[campo] !== null && datos[campo] !== "") {
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
      if (typeof update.saldo === "number" || typeof update.saldo === "string") {
        update.saldo = [
          { monto: Number(update.saldo) || 0, fecha: new Date() },
        ];
      }
      // si ya viene como array [{ monto, fecha }], lo dejás igual
    }

    // 4) Update con validación del schema
    const proyecto = await Proyecto.findOneAndUpdate(
      { idProyecto: Number(id) },
      { $set: update },   // $set = solo toca esos campos
      { returnDocument: "after", runValidators: true }
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
    console.error("Error al actualizar el proyecto: pero llega al servicio", error);
    throw error;
  }
}
//Funcion para eliminar un proyecto por su ID en la base de datos MongoDB
async function eliminarProyecto(id) {
  try {
    const proyecto = await Proyecto.findOneAndDelete({ idProyecto: id });

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

export { obtenerProyectosId, insertarProyecto, obtenerProyectos, actualizarProyecto, eliminarProyecto };
