import mongoose from "mongoose";
import Proyecto from "../models/Proyectos.js";
import Gasto from "../models/Gastos.js";
import { totalDonado } from "./serviceDonaciones.js";

// Redondea a 2 decimales para evitar residuos de punto flotante (dinero)
const redondear = (monto) => Math.round((Number(monto) || 0) * 100) / 100;

// Monto base de partida del proyecto (array saldo del documento Proyecto).
// Es el saldo inicial cargado al crear/editar el proyecto y los aportes
// manuales posteriores (agregarSaldo). Sin proyecto o sin datos = 0.
async function saldoBase(idProyecto) {
    if (!mongoose.isObjectIdOrHexString(idProyecto)) return 0;

    const proyecto = await Proyecto.findById(idProyecto).select("saldo").lean();
    if (!proyecto || !Array.isArray(proyecto.saldo)) return 0;

    return proyecto.saldo.reduce((acc, item) => {
        const monto = Number(item?.monto);
        return acc + (Number.isFinite(monto) ? monto : 0);
    }, 0);
}

// Total de gastos de UN proyecto: agregación estricta sobre la colección
// gastos filtrando por idProyecto (ObjectId). Opcionalmente excluye un gasto
// (excluirId) para no contarlo dos veces al editar. Retorna 0 si no hay datos.
async function totalGastado(idProyecto, excluirId = null) {
    if (!mongoose.isObjectIdOrHexString(idProyecto)) return 0;

    const filtro = { idProyecto: new mongoose.Types.ObjectId(idProyecto) };
    if (excluirId !== null && mongoose.isObjectIdOrHexString(excluirId)) {
        filtro._id = { $ne: new mongoose.Types.ObjectId(excluirId) };
    }

    const resultado = await Gasto.aggregate([
        { $match: filtro },
        { $group: { _id: null, total: { $sum: "$monto" } } }
    ]);

    const total = resultado.length > 0 ? Number(resultado[0].total) : 0;
    return Number.isFinite(total) ? total : 0;
}

// Ingresos de UN proyecto = monto base de partida + total de donaciones
// asociadas a ese proyecto (colección donaciones, filtrada por idProyecto).
async function ingresosProyecto(idProyecto) {
    if (!mongoose.isObjectIdOrHexString(idProyecto)) return 0;

    const [base, donado] = await Promise.all([
        saldoBase(idProyecto),
        totalDonado(idProyecto)
    ]);

    return redondear(base + donado);
}

// Saldo individual de UN proyecto:
//   Saldo Individual = (Monto Base + Total Donaciones del Proyecto)
//                    - (Total Gastos del Proyecto)
// Estrictamente filtrado por ObjectId del proyecto: dos proyectos distintos
// nunca comparten saldo. Sin donaciones ni gastos retorna 0 (no NaN ni null).
async function saldoIndividualProyecto(idProyecto) {
    if (!mongoose.isObjectIdOrHexString(idProyecto)) return 0;

    const [ingresos, gastado] = await Promise.all([
        ingresosProyecto(idProyecto),
        totalGastado(idProyecto)
    ]);

    return redondear(ingresos - gastado);
}

export {
    redondear,
    saldoBase,
    totalGastado,
    ingresosProyecto,
    saldoIndividualProyecto
};
