import Organizacion from "../models/Organizaciones.js";
import { AppError } from "../utils/AppError.js";



// Se usa $ne:false (y no activa:true) para que también cuenten como activas las organizaciones
// guardadas antes de existir el campo "activa".
const SOLO_ACTIVAS = { activa: { $ne: false } };

const MAX_INTENTOS_ID = 3;

// Devuelve la organización (activa o no) que tenga ese CUIL, o null.
// idPropio excluye a la organización que se está editando.
async function organizacionConCuil(cuil, idPropio = null) {
  const filtro = { cuil };
  if (idPropio !== null) filtro.idOrganizacion = { $ne: idPropio };
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
async function detectarCuilDuplicado(error, cuil, idPropio = null) {
  if (error.code !== 11000) return null;
  const existente = await organizacionConCuil(cuil, idPropio);
  if (existente) return existente;
  return error.keyPattern?.cuil ? {} : null;
}

async function obtenerOrganizaciones({ incluirBajas = false } = {}) {
  const filtro = incluirBajas ? {} : SOLO_ACTIVAS;
  return Organizacion.find(filtro).select("-_id").sort({ idOrganizacion: 1 }).lean();
}

async function obtenerOrganizacionPorId(id) {
  return Organizacion.findOne({ idOrganizacion: Number(id), ...SOLO_ACTIVAS }).select("-_id").lean();
}

// Para que otros módulos (ej. Donaciones) validen que una organización existe y está activa
async function existeOrganizacion(id) {
  return (await Organizacion.exists({ idOrganizacion: Number(id), ...SOLO_ACTIVAS })) !== null;
}

async function crearOrganizacion(datos) {
  const conCuil = await organizacionConCuil(datos.cuil);
  if (conCuil) throw errorCuilDuplicado(conCuil);

  // idOrganizacion = último + 1 (contando también las dadas de baja, para no reutilizar ids).
  // Si dos requests chocan en el mismo id, el índice único lo rechaza (11000) y se reintenta.
  for (let intento = 1; ; intento++) {
    const ultima = await Organizacion.findOne().sort({ idOrganizacion: -1 }).select("idOrganizacion").lean();
    const idOrganizacion = ultima ? ultima.idOrganizacion + 1 : 1;

    try {
      const nueva = await Organizacion.create({ ...datos, idOrganizacion });
      return nueva.toJSON();
    } catch (error) {
      const duplicado = await detectarCuilDuplicado(error, datos.cuil);
      if (duplicado) throw errorCuilDuplicado(duplicado);

      if (error.code === 11000 && intento < MAX_INTENTOS_ID) continue; // choque de id
      throw error;
    }
  }
}

// Solo se pueden modificar organizaciones activas. Devuelve null si no existe o está dada de baja.
async function actualizarOrganizacion(id, datos) {
  const idNumerico = Number(id);

  if (!(await existeOrganizacion(idNumerico))) return null;

  const conCuil = await organizacionConCuil(datos.cuil, idNumerico);
  if (conCuil) throw errorCuilDuplicado(conCuil);

  try {
    const actualizada = await Organizacion.findOneAndUpdate(
      { idOrganizacion: idNumerico, ...SOLO_ACTIVAS },
      { $set: datos },
      { returnDocument: "after", runValidators: true }
    );
    return actualizada ? actualizada.toJSON() : null;
  } catch (error) {
    const duplicado = await detectarCuilDuplicado(error, datos.cuil, idNumerico);
    if (duplicado) throw errorCuilDuplicado(duplicado);
    throw error;
  }
}


/**
 * BAJA LÓGICA: eliminar una organización no borra el documento, lo marca con
 * activa = false y guarda fechaBaja.
 * Devuelve null si no existe o ya estaba dada de baja.
 */

async function darDeBajaOrganizacion(id) {
  const baja = await Organizacion.findOneAndUpdate(
    { idOrganizacion: Number(id), ...SOLO_ACTIVAS },
    { $set: { activa: false, fechaBaja: new Date() } },
    { returnDocument: "after" }
  );
  return baja ? baja.toJSON() : null;
}

// REACTIVACIÓN: revierte una baja lógica (activa = true, fechaBaja = null).
// Devuelve null si la organización no existe; si ya está activa responde 409.
async function reactivarOrganizacion(id) {
  const idNumerico = Number(id);

  const existente = await Organizacion.findOne({ idOrganizacion: idNumerico }).select("activa").lean();
  if (!existente) return null;

  if (existente.activa !== false) {
    throw new AppError(409, "La organización ya está activa");
  }

  const reactivada = await Organizacion.findOneAndUpdate(
    { idOrganizacion: idNumerico, activa: false },
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
