import mongoose from "mongoose";
import Gasto from "../models/Gastos.js";
import Proyecto from "../models/Proyectos.js";
import { AppError } from "../utils/AppError.js";
import { saldoProyectosActivos } from "./serviceProyecto.js";

async function obtenerGastos() {
    return Gasto.find().sort({ _id: 1 }).lean();
}

async function obtenerGastoPorId(_id) {
    return Gasto.findById(_id).lean();
}

// Un gasto solo puede imputarse a un proyecto que exista y esté activo
async function existeProyecto(_id) {
    if (!mongoose.isObjectIdOrHexString(_id)) return false;
    return (await Proyecto.exists({ _id, activa: { $ne: false } })) !== null;
}

async function crearGasto(datos) {
    if (!(await existeProyecto(datos.idProyecto))) {
        throw new AppError(400, "El proyecto indicado no existe o está dado de baja");
    }
    const disponible = await saldoDisponible(datos.idProyecto);
    if (datos.monto > disponible) {
        throw new AppError(400, "El monto del gasto supera el saldo disponible del proyecto");
    }

    const nuevo = await Gasto.create(datos);
    return nuevo.toJSON();
}

async function actualizarGasto(_id, datos) {
    if (!(await Gasto.exists({ _id }))) return null;

    if (!(await existeProyecto(datos.idProyecto))) {
        throw new AppError(400, "El proyecto indicado no existe o está dado de baja");
    }

    // Al editar se excluye el propio gasto del cálculo, para no contarlo dos veces
    const disponible = await saldoDisponible(datos.idProyecto, _id);
    if (datos.monto > disponible) {
        throw new AppError(400, "El monto del gasto supera el saldo disponible del proyecto");
    }

    const actualizado = await Gasto.findByIdAndUpdate(
        _id,
        { $set: datos },
        { returnDocument: "after", runValidators: true }
    );
    return actualizado ? actualizado.toJSON() : null;
}

async function eliminarGasto(_id) {
    const eliminado = await Gasto.findByIdAndDelete(_id);
    return eliminado ? eliminado.toJSON() : null;
}

// Las agregaciones no convierten el texto a ObjectId: hay que hacerlo a mano
async function totalGastado(idProyecto, excluirId = null) {
    const filtro = { idProyecto: new mongoose.Types.ObjectId(idProyecto) };
    if (excluirId !== null) filtro._id = { $ne: new mongoose.Types.ObjectId(excluirId) };

    const resultado = await Gasto.aggregate([
        { $match: filtro },
        { $group: { _id: null, total: { $sum: "$monto" } } }
    ]);

    return resultado.length > 0 ? resultado[0].total : 0;
}

async function saldoDisponible(idProyecto, excluirId = null) {
    const donado = await saldoProyectosActivos(idProyecto);
    const gastado = await totalGastado(idProyecto, excluirId);
    return donado - gastado;
}

export {
    obtenerGastos,
    obtenerGastoPorId,
    crearGasto,
    actualizarGasto,
    eliminarGasto,
    totalGastado
};