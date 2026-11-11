import mongoose from "mongoose";
import Gasto from "../models/Gastos.js";
import Proyecto from "../models/Proyectos.js";
import { AppError } from "../utils/AppError.js";
import {
    redondear,
    totalGastado,
    ingresosProyecto
} from "./saldoService.js";

async function obtenerGastos() {
    return Gasto.find().sort({ _id: 1 }).lean();
}

// Gastos de un proyecto, ordenados por fecha desc; ID inválido => [].
async function obtenerGastosPorProyecto(idProyecto) {
    if (!mongoose.isObjectIdOrHexString(idProyecto)) return [];

    return Gasto.find({ idProyecto: new mongoose.Types.ObjectId(idProyecto) })
        .sort({ fecha: -1, _id: -1 })
        .lean();
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

// Saldo disponible para imputar un gasto: donaciones del proyecto menos sus
// gastos (con exclusión opcional de un gasto al editar).
async function saldoDisponible(idProyecto, excluirId = null) {
    const ingresos = await ingresosProyecto(idProyecto);
    const gastado = await totalGastado(idProyecto, excluirId);
    return redondear(ingresos - gastado);
}

export {
    obtenerGastos,
    obtenerGastosPorProyecto,
    obtenerGastoPorId,
    crearGasto,
    actualizarGasto,
    eliminarGasto,
    totalGastado
};