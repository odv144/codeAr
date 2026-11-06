import mongoose from "mongoose";
import Donacion from "../models/Donaciones.js";
import Proyecto from "../models/Proyectos.js";
import Donante from "../models/Donantes.js";
import { AppError } from "../utils/AppError.js";

async function proyectoActivo(idProyecto) {
    if (!mongoose.isObjectIdOrHexString(idProyecto)) return null;
    const proyecto = await Proyecto.findById(idProyecto).select("idOrganizacion activa").lean();
    return proyecto && proyecto.activa !== false ? proyecto : null;
}

async function existeDonante(_id) {
    if (!mongoose.isObjectIdOrHexString(_id)) return false;
    return (await Donante.exists({ _id })) !== null;
}

// Valida las referencias y devuelve la organización DEL PROYECTO: la donación
// siempre se guarda con la org de su proyecto.
async function validarReferencias({ idProyecto, idDonante }) {
    const proyecto = await proyectoActivo(idProyecto);
    if (!proyecto) {
        throw new AppError(400, "El proyecto indicado no existe o está dado de baja");
    }
    if (!(await existeDonante(idDonante))) {
        throw new AppError(400, "El donante indicado no existe");
    }
    return proyecto.idOrganizacion;
}

async function obtenerDonaciones() {
    return Donacion.find().sort({ _id: 1 }).lean();
}

// Donaciones de un proyecto, ordenadas por fecha desc; ID inválido => [].
async function obtenerDonacionesPorProyecto(idProyecto) {
    if (!mongoose.isObjectIdOrHexString(idProyecto)) return [];

    return Donacion.find({ idProyecto: new mongoose.Types.ObjectId(idProyecto) })
        .populate("idDonante", "nombre apellido")
        .sort({ fecha: -1, _id: -1 })
        .lean();
}

async function obtenerDonacionPorId(_id) {
    return Donacion.findById(_id).lean();
}

async function crearDonacion(datos) {
    const idOrganizacion = await validarReferencias(datos);

    const nueva = await Donacion.create({ ...datos, idOrganizacion });

    return nueva.toJSON();
}

async function actualizarDonacion(_id, datos) {
    if (!(await Donacion.exists({ _id }))) return null;

    const idOrganizacion = await validarReferencias(datos);

    const actualizada = await Donacion.findByIdAndUpdate(
        _id,
        { $set: { ...datos, idOrganizacion } },
        { returnDocument: "after", runValidators: true }
    );
    return actualizada ? actualizada.toJSON() : null;
}

async function eliminarDonacion(_id) {
    const eliminada = await Donacion.findByIdAndDelete(_id);
    return eliminada ? eliminada.toJSON() : null;
}

// Total donado de un proyecto (agregación estricta por idProyecto); sin datos => 0.
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
    obtenerDonacionesPorProyecto,
    obtenerDonacionPorId,
    crearDonacion,
    actualizarDonacion,
    eliminarDonacion,
    totalDonado
};
