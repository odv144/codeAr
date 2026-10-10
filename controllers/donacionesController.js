import * as servicio from "../services/serviceDonaciones.js";
import { AppError } from "../utils/AppError.js";

const obtenerDonaciones = async (req, res, next) => {
    try {
        const donaciones = await servicio.obtenerDonaciones();
        res.status(200).json(donaciones);
    } catch (error) {
        next(error);
    }
};

const obtenerDonacionPorId = async (req, res, next) => {
    try {
        const donacion = await servicio.obtenerDonacionPorId(req.params.id);
        if (!donacion) throw new AppError(404, "Donación no encontrada");
        res.status(200).json(donacion);
    } catch (error) {
        next(error);
    }
};

const crearDonacion = async (req, res, next) => {
    try {
        const nuevaDonacion = await servicio.crearDonacion(req.datosDonacion);
        res.status(201).json(nuevaDonacion);
    } catch (error) {
        next(error);
    }
};

const actualizarDonacion = async (req, res, next) => {
    try {
        const donacion = await servicio.actualizarDonacion(req.params.id, req.datosDonacion);
        if (!donacion) throw new AppError(404, "Donación no encontrada");
        res.status(200).json(donacion);
    } catch (error) {
        next(error);
    }
};

const eliminarDonacion = async (req, res, next) => {
    try {
        const donacion = await servicio.eliminarDonacion(req.params.id);
        if (!donacion) throw new AppError(404, "Donación no encontrada");
        res.status(200).json({ mensaje: "Donación eliminada correctamente", donacion });
    } catch (error) {
        next(error);
    }
};

export {
    obtenerDonaciones,
    obtenerDonacionPorId,
    crearDonacion,
    actualizarDonacion,
    eliminarDonacion
};