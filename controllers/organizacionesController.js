import * as servicio from "../services/serviceOrganizacion.js";
import { AppError } from "../utils/AppError.js";


// GET /organizaciones            -> solo activas
// GET /organizaciones?incluirBajas=true -> también las dadas de baja
const obtenerOrganizaciones = async (req, res, next) => {
    try {
        const incluirBajas = req.query.incluirBajas === "true";
        const organizaciones = await servicio.obtenerOrganizaciones({ incluirBajas });
        res.status(200).json(organizaciones);
    } catch (error) {
        next(error);
    }
};

// GET /organizaciones/:id
const obtenerOrganizacionPorId = async (req, res, next) => {
    try {
        const organizacion = await servicio.obtenerOrganizacionPorId(req.params.id);

        if (!organizacion) {
            throw new AppError(404, "Organización no encontrada");
        }

        res.status(200).json(organizacion);
    } catch (error) {
        next(error);
    }
};

// POST /organizaciones
const crearOrganizacion = async (req, res, next) => {
    try {
        const nuevaOrganizacion = await servicio.crearOrganizacion(req.datosOrganizacion);
        res.status(201).json(nuevaOrganizacion);
    } catch (error) {
        next(error);
    }
};

// PUT /organizaciones/:id
const actualizarOrganizacion = async (req, res, next) => {
    try {
        const organizacion = await servicio.actualizarOrganizacion(req.params.id, req.datosOrganizacion);

        if (!organizacion) {
            throw new AppError(404, "Organización no encontrada");
        }

        res.status(200).json(organizacion);
    } catch (error) {
        next(error);
    }
};

// DELETE /organizaciones/:id  -> BAJA LÓGICA (no borra el documento, lo marca como inactivo)
const darDeBajaOrganizacion = async (req, res, next) => {
    try {
        const organizacion = await servicio.darDeBajaOrganizacion(req.params.id);

        if (!organizacion) {
            throw new AppError(404, "Organización no encontrada");
        }

        res.status(200).json({
            mensaje: "Organización dada de baja correctamente",
            organizacion
        });
    } catch (error) {
        next(error);
    }
};

// PATCH /organizaciones/:id/reactivar  -> revierte la baja lógica
const reactivarOrganizacion = async (req, res, next) => {
    try {
        const organizacion = await servicio.reactivarOrganizacion(req.params.id);

        if (!organizacion) {
            throw new AppError(404, "Organización no encontrada");
        }

        res.status(200).json({
            mensaje: "Organización reactivada correctamente",
            organizacion
        });
    } catch (error) {
        next(error);
    }
};

export {
    obtenerOrganizaciones,
    obtenerOrganizacionPorId,
    crearOrganizacion,
    actualizarOrganizacion,
    darDeBajaOrganizacion,
    reactivarOrganizacion
};
