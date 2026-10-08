import Gasto from "../models/Gastos.js";
import Proyecto from "../models/Proyectos.js";
import { AppError } from "../utils/AppError.js";

async function obtenerGastos() {
    return Gasto.find().select("-_id").sort({ idGasto: 1 }).lean();
}

async function obtenerGastoPorId(id) {
    return Gasto.findOne({ idGasto: Number(id) }).select("-_id").lean();
}

async function existeProyecto(id) {
    return (await Proyecto.exists({ idProyecto: Number(id) })) !== null;
}

async function crearGasto(datos) {
    if (!(await existeProyecto(datos.idProyecto))) {
        throw new AppError(400, "El proyecto indicado no existe");
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
        throw new AppError(400, "El proyecto indicado no existe");
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

export { 
    obtenerGastos,
    obtenerGastoPorId,
    crearGasto,
    actualizarGasto,
    eliminarGasto
};