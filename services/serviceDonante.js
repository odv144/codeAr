import { connectDB } from "../config/db.js";
import mongoose from "mongoose";
import Donante from "../models/Donantes.js";;
import Donacion from "../models/Donaciones.js";
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

// Servicio para obtener un donante por su _id de MongoDB
async function obtenerDonantesId(id) {
  try {
    const donante = await Donante.findById(id);
    if (!donante) {
      throw new Error("Donante no encontrado");
    }
    return donante;
  } catch (error) {
    console.error("Error al obtener el donante por ID:", error);
    throw error;
  }
}


async function obtenerTotalesDonantes() {
  const totales = await Donacion.aggregate([
    {
      $group: {
        _id: "$idDonante",
        totalDonado: { $sum: "$monto" },
        cantidadDonaciones: { $sum: 1 }
      }
    }
  ]);

  return totales;
}



async function insertarDonante(datos) {
  const { nombre, apellido, dni, telefono, email } = datos;

  
  if (!nombre || !apellido || !dni || !telefono || !email) {
    const err = new Error("Faltan campos obligatorios");
    err.status = 400;
    throw err;
  }
  if (Donante.db.readyState !== 1) {
    throw new Error("MongoDB no está conectado (readyState !== 1)");
  }
  const nuevo = await Donante.create({
    nombre: String(nombre).trim(),
    apellido: String(apellido).trim(),
    dni: String(dni).trim(),
    telefono: String(telefono).trim(),
    email: String(email).trim(),
  });
  console.log("Donante guardado:", nuevo._id);
  return nuevo.toObject();
}



async function actualizarDonante(id, datos) {
  try {
    const permitidos = ["nombre", "apellido", "dni", "telefono", "email"];
    const update = {};

    for (const campo of permitidos) {
      if (datos[campo] !== undefined && datos[campo] !== null && datos[campo] !== "") {
        update[campo] = datos[campo];
      }
    }
    if (Object.keys(update).length === 0) {
      const err = new Error("No se enviaron datos para actualizar");
      err.status = 400;
      throw err;
    }
    if (update.nombre !== undefined) update.nombre = String(update.nombre).trim();
    if (update.apellido !== undefined) update.apellido = String(update.apellido).trim();
    if (update.dni !== undefined) update.dni = String(update.dni).trim();
    if (update.telefono !== undefined) update.telefono = String(update.telefono).trim();
    if (update.email !== undefined) update.email = String(update.email).trim();
  

    const donante = await Donante.findOneAndUpdate(
      { _id: id },
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
    const donante = await Donante.findByIdAndDelete(id);

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

export { obtenerDonantesId, insertarDonante, obtenerDonantes, actualizarDonante, eliminarDonante,obtenerTotalesDonantes };