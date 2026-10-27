import mongoose from "mongoose";
import Organizacion from "../models/Organizaciones.js";
import { AppError } from "../utils/AppError.js";



// Se usa $ne:false (y no activa:true) para que también cuenten como activas las organizaciones
// guardadas antes de existir el campo "activa".
const SOLO_ACTIVAS = { activa: { $ne: false } };

// Devuelve la organización (activa o no) que tenga ese CUIL, o null.
// _idPropio excluye a la organización que se está editando.
async function organizacionConCuil(cuil, _idPropio = null) {
  const filtro = { cuil };
  if (_idPropio !== null) filtro._id = { $ne: _idPropio };
  return Organizacion.findOne(filtro).select("activa").lean();
}

// El CUIL es único aunque la otra organización esté dada de baja
const errorCuilDuplicado = (existente) =>
  new AppError(
    409,
    existente?.activa === false
      ? "Ya existe una organización con ese CUIL, pero está dada de baja"
      : "Ya existe una organización con ese CUIL"
  );

// Segunda línea de defensa: si dos requests guardan el mismo CUIL al mismo tiempo, el índice
// único de Mongo lo rechaza (código 11000). Devuelve la organización en conflicto, o null si
// el error no se debe al CUIL. (Atlas informa el índice en error.keyPattern; si el servidor
// no lo informa, se consulta directamente.)
async function detectarCuilDuplicado(error, cuil, _idPropio = null) {
  if (error.code !== 11000) return null;
  const existente = await organizacionConCuil(cuil, _idPropio);
  if (existente) return existente;
  return error.keyPattern?.cuil ? {} : null;
}

async function obtenerOrganizaciones({ incluirBajas = false } = {}) {
  const filtro = incluirBajas ? {} : SOLO_ACTIVAS;
  return Organizacion.find(filtro).sort({ _id: 1 }).lean();
}

// Busca por _id (ObjectId de MongoDB). Por defecto solo devuelve organizaciones activas;
// con incluirBajas también devuelve las dadas de baja (para ver su detalle y poder reactivarlas).
async function obtenerOrganizacionPorId(_id, { incluirBajas = false } = {}) {
  const filtro = incluirBajas ? { _id } : { _id, ...SOLO_ACTIVAS };
  return Organizacion.findOne(filtro).lean();
}

// Para que otros módulos validen que una organización existe y está activa (por su _id)
async function existeOrganizacion(_id) {
  if (!mongoose.isValidObjectId(_id)) return false;
  return (await Organizacion.exists({ _id, ...SOLO_ACTIVAS })) !== null;
}

async function crearOrganizacion(datos) {
  const conCuil = await organizacionConCuil(datos.cuil);
  if (conCuil) throw errorCuilDuplicado(conCuil);

  // MongoDB genera el _id. Si dos requests guardan el mismo CUIL al mismo tiempo,
  // el índice único lo rechaza (11000).
  try {
    const nueva = await Organizacion.create(datos);
    return nueva.toJSON();
  } catch (error) {
    const duplicado = await detectarCuilDuplicado(error, datos.cuil);
    if (duplicado) throw errorCuilDuplicado(duplicado);
    throw error;
  }
}

// Solo se pueden modificar organizaciones activas. Devuelve null si no existe o está dada de baja.
async function actualizarOrganizacion(_id, datos) {
  const existente = await obtenerOrganizacionPorId(_id);
  if (!existente) return null;

  const conCuil = await organizacionConCuil(datos.cuil, existente._id);
  if (conCuil) throw errorCuilDuplicado(conCuil);

  try {
    const actualizada = await Organizacion.findOneAndUpdate(
      { _id, ...SOLO_ACTIVAS },
      { $set: datos },
      { returnDocument: "after", runValidators: true }
    );
    return actualizada ? actualizada.toJSON() : null;
  } catch (error) {
    const duplicado = await detectarCuilDuplicado(error, datos.cuil, existente._id);
    if (duplicado) throw errorCuilDuplicado(duplicado);
    throw error;
  }
}


/**
 * BAJA LÓGICA: eliminar una organización no borra el documento, lo marca con
 * activa = false y guarda fechaBaja.
 * Devuelve null si no existe o ya estaba dada de baja.
 */

async function darDeBajaOrganizacion(_id) {
  const baja = await Organizacion.findOneAndUpdate(
    { _id, ...SOLO_ACTIVAS },
    { $set: { activa: false, fechaBaja: new Date() } },
    { returnDocument: "after" }
  );
  return baja ? baja.toJSON() : null;
}

// REACTIVACIÓN: revierte una baja lógica (activa = true, fechaBaja = null).
// Devuelve null si la organización no existe; si ya está activa responde 409.
async function reactivarOrganizacion(_id) {
  const existente = await Organizacion.findById(_id).select("activa").lean();
  if (!existente) return null;

  if (existente.activa !== false) {
    throw new AppError(409, "La organización ya está activa");
  }

  const reactivada = await Organizacion.findOneAndUpdate(
    { _id, activa: false },
    { $set: { activa: true, fechaBaja: null } },
    { returnDocument: "after" }
  );
  return reactivada ? reactivada.toJSON() : null;
}

export {
  obtenerOrganizaciones,
  obtenerOrganizacionPorId,
  existeOrganizacion,
  crearOrganizacion,
  actualizarOrganizacion,
  darDeBajaOrganizacion,
  reactivarOrganizacion
};
