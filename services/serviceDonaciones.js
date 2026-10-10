import Donacion from "../models/Donaciones.js";
import Proyecto from "../models/Proyectos.js";
import Donante from "../models/Donantes.js";
import { AppError } from "../utils/AppError.js";
import { existeOrganizacion } from "./serviceOrganizacion.js";

async function existeProyectoActivo(idProyecto) {
    return (await Proyecto.exists({ idProyecto: Number(idProyecto), activa: { $ne: false } })) !== null;
}

async function existeDonante(idDonante) {
    return (await Donante.exists({ idDonante: Number(idDonante) })) !== null;
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
    return Donacion.find().select("-_id").sort({ idDonacion: 1 }).lean();
}

async function obtenerDonacionPorId(id) {
    return Donacion.findOne({ idDonacion: Number(id) }).select("-_id").lean();
}

async function crearDonacion(datos) {
    await validarReferencias(datos);

    const ultima = await Donacion.findOne().sort({ idDonacion: -1 }).select("idDonacion").lean();
    const idDonacion = ultima ? ultima.idDonacion + 1 : 1;

    const nueva = await Donacion.create({ ...datos, idDonacion });

    return nueva.toJSON();
}

async function actualizarDonacion(id, datos) {
    const idNumerico = Number(id);

    if (!(await Donacion.exists({ idDonacion: idNumerico }))) return null;

    await validarReferencias(datos);

    const actualizada = await Donacion.findOneAndUpdate(
        { idDonacion: idNumerico },
        { $set: datos },
        { returnDocument: "after", runValidators: true }
    );
    return actualizada ? actualizada.toJSON() : null;
}

async function eliminarDonacion(id) {
    const eliminada = await Donacion.findOneAndDelete({ idDonacion: Number(id) });
    return eliminada ? eliminada.toJSON() : null;
}

export {
    obtenerDonaciones,
    obtenerDonacionPorId,
    crearDonacion,
    actualizarDonacion,
    eliminarDonacion
};