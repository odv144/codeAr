import * as servicio from "../services/serviceGastos.js";
import { AppError } from "../utils/AppError.js";


// GET /gastos
const obtenerGastos = async (req, res, next) => {
    try {
        const gasto = await servicio.obtenerGastos();
        res.status(200).json(gasto);
    } catch (error) {
        next(error);
    }
};

// GET /gasto/:id
const obtenerGastoPorId = async (req, res, next) => {
    try {
        const gasto = await servicio.obtenerGastoPorId(req.params.id);

        if (!gasto) {
            throw new AppError(404, "Gasto no encontrado");
        }

        res.status(200).json(gasto);
    } catch (error) {
        next(error);
    }
};

// POST /gastos
const crearGasto = async (req, res, next) => {
    try {
        const nuevoGasto = await servicio.crearGasto(req.datosGasto);
        res.status(201).json(nuevoGasto);
    } catch (error) {
        next(error);
    }
};

// PUT /gastos/:id
const actualizarGasto = async (req, res, next) => {
    try {
        const gasto = await servicio.actualizarGasto(req.params.id, req.datosGasto);

        if (!gasto) {
            throw new AppError(404, "Gasto no encontrado");
        }

        res.status(200).json(gasto);
    } catch (error) {
        next(error);
    }
};

// DELETE /gastos/:id
const eliminarGasto = async (req, res, next) => {
    try {
        const gasto = await servicio.eliminarGasto(req.params.id);

        if (!gasto) {
            throw new AppError(404, "Gasto no encontrado");
        }

        res.status(200).json({
            mensaje: "Gasto eliminado correctamente",
            gasto
        });
    } catch (error) {
        next(error);
    }
};

export {
    obtenerGastos,
    obtenerGastoPorId, 
    crearGasto,
    actualizarGasto,
    eliminarGasto
};
