import Gasto from "../models/Gastos.js";
import Proyecto from "../models/Proyectos.js";
import { AppError } from "../utils/AppError.js";
import { saldoProyectosActivos } from "./serviceProyecto.js";

async function obtenerGastos() {
    return Gasto.find().select("-_id").sort({ idGasto: 1 }).lean();
}

async function obtenerGastoPorId(id) {
    return Gasto.findOne({ idGasto: Number(id) }).select("-_id").lean();
}

async function existeProyecto(id) {
    return (await Proyecto.exists({ idProyecto: Number(id), activa: { $ne: false } })) !== null;
}

async function crearGasto(datos) {
    if (!(await existeProyecto(datos.idProyecto))) {
        throw new AppError(400, "El proyecto indicado no existe o está dado de baja");
    }
    const disponible = await saldoDisponible(datos.idProyecto);
    if (datos.monto > disponible) {
        throw new AppError(400, "El monto del gasto supera el saldo disponible del proyecto");
    }
    const ultimo = await Gasto.findOne().sort({ idGasto: -1 }).select("idGasto").lean();
    const idGasto = ultimo ? ultimo.idGasto + 1 : 1;
    const nuevo = await Gasto.create({ ...datos, idGasto });
    return nuevo.toJSON();
}

async function actualizarGasto(id, datos) {
    const idNumerico = Number(id);

    if (!(await Gasto.exists({ idGasto: idNumerico }))) return null;

    if (!(await existeProyecto(datos.idProyecto))) {
        throw new AppError(400, "El proyecto indicado no existe o está dado de baja");
    }

    const disponible = await saldoDisponible(datos.idProyecto, idNumerico);
    if (datos.monto > disponible) {
        throw new AppError(400, "El monto del gasto supera el saldo disponible del proyecto");
    }
    
    const actualizado = await Gasto.findOneAndUpdate(
        { idGasto: idNumerico },
        { $set: datos },
        { returnDocument: "after", runValidators: true }
    );
    return actualizado ? actualizado.toJSON() : null;
}

async function eliminarGasto(id) {
    const eliminado = await Gasto.findOneAndDelete({ idGasto: Number(id) });
    return eliminado ? eliminado.toJSON() : null;
}

async function totalGastado(idProyecto, excluirIdGasto = null) {
  const filtro = { idProyecto: Number(idProyecto) };
  if (excluirIdGasto !== null) filtro.idGasto = { $ne: Number(excluirIdGasto) };

  const resultado = await Gasto.aggregate([
    { $match: filtro },
    { $group: { _id: null, total: { $sum: "$monto" } } }
  ]);

  return resultado.length > 0 ? resultado[0].total : 0;
}

async function saldoDisponible(idProyecto, excluirIdGasto = null) {
    const donado = await saldoProyectosActivos(idProyecto);
    const gastado = await totalGastado(idProyecto, excluirIdGasto);
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