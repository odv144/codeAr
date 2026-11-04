import mongoose from "mongoose";
import Donacion from "../models/Donaciones.js";
import Proyecto from "../models/Proyectos.js";
import Donante from "../models/Donantes.js";
import { AppError } from "../utils/AppError.js";
import { existeOrganizacion } from "./serviceOrganizacion.js";

async function existeProyectoActivo(_id) {
    if (!mongoose.isObjectIdOrHexString(_id)) return false;
    return (await Proyecto.exists({ _id, activa: { $ne: false } })) !== null;
}

async function existeDonante(_id) {
    if (!mongoose.isObjectIdOrHexString(_id)) return false;
    return (await Donante.exists({ _id })) !== null;
}

async function validarReferencias({ idProyecto, idDonante, idOrganizacion }) {
    if (!(await existeProyectoActivo(idProyecto))) {
        throw new AppError(400, "El proyecto indicado no existe o está dado de baja");
    }
    if (!(await existeDonante(idDonante))) {
        throw new AppError(400, "El donante indicado no existe");
    }
    if (!(await existeOrganizacion(idOrganizacion))) {
        throw new AppError(400, "La organización indicada no existe o está dada de baja");
    }
}

async function obtenerDonaciones() {
    return Donacion.find().sort({ _id: 1 }).lean();
}

async function obtenerDonacionPorId(_id) {
    return Donacion.findById(_id).lean();
}

async function crearDonacion(datos) {
    await validarReferencias(datos);

    const nueva = await Donacion.create(datos);

    return nueva.toJSON();
}

async function actualizarDonacion(_id, datos) {
    if (!(await Donacion.exists({ _id }))) return null;

    await validarReferencias(datos);

    const actualizada = await Donacion.findByIdAndUpdate(
        _id,
        { $set: datos },
        { returnDocument: "after", runValidators: true }
    );
    return actualizada ? actualizada.toJSON() : null;
}

async function eliminarDonacion(_id) {
    const eliminada = await Donacion.findByIdAndDelete(_id);
    return eliminada ? eliminada.toJSON() : null;
}

// Total de donaciones de UN proyecto: agregación estricta sobre la colección
// donaciones filtrando por idProyecto (ObjectId). Sin ID válido o sin
// donaciones retorna 0 (nunca NaN ni null).
async function totalDonado(idProyecto) {
    if (!mongoose.isObjectIdOrHexString(idProyecto)) return 0;

    const resultado = await Donacion.aggregate([
        { $match: { idProyecto: new mongoose.Types.ObjectId(idProyecto) } },
        { $group: { _id: null, total: { $sum: "$monto" } } }
    ]);

    const total = resultado.length > 0 ? Number(resultado[0].total) : 0;
    return Number.isFinite(total) ? total : 0;
}

export {
    obtenerDonaciones,
    obtenerDonacionPorId,
    crearDonacion,
    actualizarDonacion,
    eliminarDonacion,
    totalDonado
};
