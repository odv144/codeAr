import { connectDB } from "../config/db.js";
import mongoose from "mongoose";
import Donante from "../models/Donantes.js";;

// Servicio para obtener todos los donantes desde la base de datos MongoDB
async function obtenerDonantes() {
  try {
    const donantes = await Donante.find();
    return donantes;
  } catch (error) {
    console.error("Error al obtener los donantes:", error);
  } finally {
  }
}

// Servicio para obtener un donante por su ID (idDonante) desde MongoDB
async function obtenerDonantesId(id) {
  try {
    const donante = await Donante.findOne({ idDonante: Number(id) });
    if (!donante) {
      throw new Error("Donante no encontrado");
    }
    return donante;
  } catch (error) {
    console.error("Error al obtener el donante por ID:", error);
    throw error;
  }
}

// Función para insertar datos en la base de datos
async function insertarDonante(datos) {
  const { nombre, apellido, dni, telefono, email, monto, fecha } = datos;

  if (!nombre || !apellido || !dni || !telefono || !email || !monto || !fecha) {
    const err = new Error("Faltan campos obligatorios");
    err.status = 400;
    throw err;
  }

  // Verificar que haya conexión
  if (Donante.db.readyState !== 1) {
    throw new Error("MongoDB no está conectado (readyState !== 1)");
  }

  // Lógica de Omar para autoincrementar el ID manteniendo la estructura antigua
  const ultimo = await Donante.findOne()
    .sort({ idDonante: -1 })
    .select("idDonante")
    .lean();

  const idDonante = ultimo ? ultimo.idDonante + 1 : 1;

  const nuevo = await Donante.create({
    idDonante,
    nombre: String(nombre).trim(),
    apellido: String(apellido).trim(),
    dni: String(dni).trim(),
    telefono: String(telefono).trim(),
    email: String(email).trim(),
    monto: Number(monto) || 0,
    fecha: new Date(fecha),
  });

  console.log("Donante guardado:", nuevo._id, "idDonante:", nuevo.idDonante);
  return nuevo.toObject();
}

// Función para actualizar un donante por su ID
async function actualizarDonante(id, datos) {
  try {
    // 1) Solo campos permitidos (evita que manden idDonante, _id, etc.)
    const permitidos = ["nombre", "apellido", "dni", "telefono", "email", "monto", "fecha"];
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
    if (update.nombre !== undefined) update.nombre = String(update.nombre).trim();
    if (update.apellido !== undefined) update.apellido = String(update.apellido).trim();
    if (update.dni !== undefined) update.dni = String(update.dni).trim();
    if (update.telefono !== undefined) update.telefono = String(update.telefono).trim();
    if (update.email !== undefined) update.email = String(update.email).trim();
    
    if (update.monto !== undefined) {
      update.monto = Number(update.monto);
      if (Number.isNaN(update.monto)) {
        const err = new Error("monto debe ser un número");
        err.status = 400;
        throw err;
      }
    }

    if (update.fecha !== undefined) {
      update.fecha = new Date(update.fecha);
    }

    // 4) Update con validación del schema
    const donante = await Donante.findOneAndUpdate(
      { idDonante: Number(id) },
      { $set: update },   // $set = solo toca esos campos
      { returnDocument: "after", runValidators: true }
    );

    if (!donante) {
      const err = new Error("Donante no encontrado");
      err.status = 404;
      throw err;
    }

    return donante;
  } catch (error) {
    // Errores de validación de Mongoose
    if (error.name === "ValidationError") {
      error.status = 400;
    }
    console.error("Error al actualizar el donante: pero llega al servicio", error);
    throw error;
  }
}

// Función para eliminar un donante por su ID
async function eliminarDonante(id) {
  try {
    const donante = await Donante.findOneAndDelete({ idDonante: Number(id) });

    if (!donante) {
      const error = new Error("Donante no encontrado");
      error.statusCode = 404;
      throw error;
    }

    return donante;
  } catch (error) {
    console.error("Error al eliminar el donante:", error);
    throw error;
  }
}

export { obtenerDonantesId, insertarDonante, obtenerDonantes, actualizarDonante, eliminarDonante };