import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { obtenerDonaciones, obtenerDonacionPorId, crearDonacion, actualizarDonacion, eliminarDonacion } from "../services/serviceDonaciones.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Modelos (clases simples) que todavía se usan con archivos JSON
import Donante from "../models/Donantes.js";
import Gasto from "../models/Gastos.js";

// Servicios con MongoDB
import {
    obtenerProyectosId,
    insertarProyecto,
    obtenerProyectos,
    actualizarProyecto,
    eliminarProyecto
} from "../services/serviceProyecto.js";
import {
    obtenerOrganizaciones,
    crearOrganizacion,
    obtenerOrganizacionPorId,
    actualizarOrganizacion,
    darDeBajaOrganizacion
} from "../services/serviceOrganizacion.js";
import { validarDatosOrganizacion } from "../utils/validacionesOrganizacion.js";
import { AppError } from "../utils/AppError.js";
import {
    obtenerGastos,
    crearGasto
} from "../services/serviceGastos.js";

// Rutas de los JSON (organizaciones y proyectos ya NO se leen de acá)
const gastosPath = path.join(__dirname, "../data/gastos.json");
const donantesPath = path.join(__dirname, "../data/donantes.json");


/* ===================== HOME ===================== */

const renderHome = (req, res) => {
    res.render("index", { titulo: "Panel Principal - Backend" });
};


/* ===================== PROYECTOS (MongoDB) ===================== */

const renderProyectos = async (req, res) => {
    try {
        const proyectos = await obtenerProyectos();
        res.render("proyectos", { proyectos });
    } catch (error) {
        res.status(500).send("Error al cargar proyectos");
    }
};

const renderCrearProyecto = (req, res) => {
    res.render("proyectosCrear");
};

const guardarProyectoDesdeVista = async (req, res) => {
    try {
        const { idOrganizacion, nomProyecto, descripcion, saldo } = req.body;

        // insertarProyecto calcula el idProyecto y arma el saldo inicial por su cuenta
        await insertarProyecto({ idOrganizacion, nomProyecto, descripcion, saldo });

        res.redirect("/vistas/proyectos");
    } catch (error) {
        const mensaje = error.status === 400
            ? error.message
            : "Error al guardar el proyecto";
        res.status(error.status || 500).render("error", { mensaje });
    }
};

const renderProyectoDetalle = async (req, res, next) => {
    try {
        const proyecto = await obtenerProyectosId(req.params.id);
        res.render("proyectoDetalle", { proyecto });
    } catch (error) {
        next(mapearProyectoNoEncontrado(error));
    }
};

// obtenerProyectosId lanza un Error simple sin status: acá lo convertimos en 404 real
// para que errorHandler muestre "Proyecto no encontrado" y no un 500 genérico.
const mapearProyectoNoEncontrado = (error) =>
    error.message === "Proyecto no encontrado"
        ? new AppError(404, "Proyecto no encontrado")
        : error;

const renderEditarProyecto = async (req, res, next) => {
    try {
        const proyecto = await obtenerProyectosId(req.params.id);
        res.render("proyectoEditar", { proyecto });
    } catch (error) {
        next(mapearProyectoNoEncontrado(error));
    }
};

const guardarEdicionProyecto = async (req, res, next) => {
    try {
        const { idOrganizacion, nomProyecto, descripcion, saldo } = req.body;

        // Si "saldo" viene vacío, actualizarProyecto lo omite y conserva el historial
        await actualizarProyecto(req.params.id, { idOrganizacion, nomProyecto, descripcion, saldo });

        res.redirect("/vistas/proyectos");
    } catch (error) {
        next(mapearProyectoNoEncontrado(error));
    }
};

const renderEliminarProyecto = async (req, res, next) => {
    try {
        const proyecto = await obtenerProyectosId(req.params.id);
        res.render("proyectoEliminar", { proyecto });
    } catch (error) {
        next(mapearProyectoNoEncontrado(error));
    }
};

const eliminarProyectoVista = async (req, res, next) => {
    try {
        await eliminarProyecto(Number(req.params.id));
        res.redirect("/vistas/proyectos");
    } catch (error) {
        next(error.statusCode === 404
            ? new AppError(404, "Proyecto no encontrado")
            : error);
    }
};


/* ===================== ORGANIZACIONES (MongoDB) ===================== */

const renderOrganizaciones = async (req, res) => {
    try {
        // Solo organizaciones activas (las dadas de baja lógica no se muestran)
        const organizaciones = await obtenerOrganizaciones();
        res.render("organizaciones", { organizaciones });
    } catch (error) {
        res.status(500).send("Error al cargar organizaciones");
    }
};

const renderCrearOrganizacion = (req, res) => {
    res.render("organizacionesCrear");
};

const guardarOrganizacionDesdeVista = async (req, res) => {
    try {
        // Mismas validaciones que usa la API
        const { errores, datos } = validarDatosOrganizacion(req.body);
        if (errores.length > 0) {
            return res.status(400).render("error", { mensaje: errores.join(" | ") });
        }

        // Asigna idOrganizacion, controla CUIL duplicado y guarda en Mongo
        await crearOrganizacion(datos);

        res.redirect("/vistas/organizaciones");
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.status).render("error", { mensaje: error.message });
        }
        console.error("Error al guardar la organización:", error);
        res.status(500).render("error", { mensaje: "Error al guardar la organización" });
    }
};

/* ============ ORGANIZACIONES: detalle / edición / baja lógica (vistas) ============ */

// Devuelve null si la organización no existe o está dada de baja (baja lógica)
const organizacionNoEncontrada = () => new AppError(404, "Organización no encontrada");

const renderOrganizacionDetalle = async (req, res, next) => {
    try {
        const organizacion = await obtenerOrganizacionPorId(req.params.id);
        if (!organizacion) throw organizacionNoEncontrada();
        res.render("organizacionDetalle", { organizacion });
    } catch (error) {
        next(error);
    }
};

const renderEditarOrganizacion = async (req, res, next) => {
    try {
        const organizacion = await obtenerOrganizacionPorId(req.params.id);
        if (!organizacion) throw organizacionNoEncontrada();
        res.render("organizacionEditar", { organizacion });
    } catch (error) {
        next(error);
    }
};

const guardarEdicionOrganizacion = async (req, res, next) => {
    try {
        // Mismas validaciones que la API y que la creación desde la vista
        const { errores, datos } = validarDatosOrganizacion(req.body);
        if (errores.length > 0) throw new AppError(400, errores.join(" | "));

        // actualiza solo organizaciones activas; null = no existe o dada de baja
        const organizacion = await actualizarOrganizacion(req.params.id, datos);
        if (!organizacion) throw organizacionNoEncontrada();

        res.redirect("/vistas/organizaciones");
    } catch (error) {
        next(error);
    }
};

const renderEliminarOrganizacion = async (req, res, next) => {
    try {
        const organizacion = await obtenerOrganizacionPorId(req.params.id);
        if (!organizacion) throw organizacionNoEncontrada();
        res.render("organizacionEliminar", { organizacion });
    } catch (error) {
        next(error);
    }
};

// BAJA LÓGICA: no borra el documento, lo marca como inactiva (serviceOrganizacion.js)
const eliminarOrganizacionVista = async (req, res, next) => {
    try {
        const baja = await darDeBajaOrganizacion(Number(req.params.id));
        if (!baja) throw organizacionNoEncontrada();
        res.redirect("/vistas/organizaciones");
    } catch (error) {
        next(error);
    }
};


/* ===================== GASTOS (MongoDB) ===================== */

const renderGastos = async (req, res) => {
    try {
        const gastos = await obtenerGastos() ;
        res.render("gastos", { gastos });
    } catch (error) {
        res.status(500).send("Error al cargar gastos");
    }
};
const renderCrearGasto = (req, res) => {
    res.render("gastosCrear");
};

const guardarGastoDesdeVista = async (req, res) => {
    try {
        const { idProyecto, descripcion, monto, fecha } = req.body;
        await crearGasto({ idProyecto: Number(idProyecto) , descripcion, monto: Number(monto) , fecha });
        res.redirect("/vistas/gastos");
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.status).render("error", { mensaje: error.message });
        }
        res.status(500).send("Error al guardar el gasto");
    }
};


/* ===================== DONACIONES ===================== */

const renderDonaciones = async (req, res) => {
    try {
        const donaciones = await obtenerDonaciones();
        res.render("donaciones", { donaciones });
    } catch (error) {
        res.status(500).send("Error al cargar donaciones");
    }
};

const renderCrearDonacion = (req, res) => {
    res.render("donacionesCrear");
};

const guardarDonacionDesdeVista = async (req, res) => {
    try {
        const { monto, cbu, fecha, idProyecto, idDonante, idOrganizacion } = req.body;
        await crearDonacion({
            monto: Number(monto),
            cbu,
            fecha,
            idProyecto: Number(idProyecto),
            idDonante: Number(idDonante),
            idOrganizacion: Number(idOrganizacion)
        });
        res.redirect("/vistas/donaciones");
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.status).render("error", { mensaje: error.message });
        }
        res.status(500).send("Error al guardar la donación");
    }
};

const donacionNoEncontrada = () => new AppError(404, "Donación no encontrada");

const renderDonacionDetalle = async (req, res, next) => {
    try {
        const donacion = await obtenerDonacionPorId(req.params.id);
        if (!donacion) throw donacionNoEncontrada();
        res.render("donacionDetalle", { donacion });
    } catch (error) {
        next(error);
    }
};

const renderEditarDonacion = async (req, res, next) => {
    try {
        const donacion = await obtenerDonacionPorId(req.params.id);
        if (!donacion) throw donacionNoEncontrada();
        res.render("donacionEditar", { donacion });
    } catch (error) {
        next(error);
    }
};

const guardarEdicionDonacion = async (req, res, next) => {
    try {
        const { monto, cbu, fecha, idProyecto, idDonante, idOrganizacion } = req.body;
        const donacion = await actualizarDonacion(req.params.id, {
            monto: Number(monto),
            cbu,
            fecha,
            idProyecto: Number(idProyecto),
            idDonante: Number(idDonante),
            idOrganizacion: Number(idOrganizacion)
        });
        if (!donacion) throw donacionNoEncontrada();
        res.redirect("/vistas/donaciones");
    } catch (error) {
        next(error);
    }
};

const renderEliminarDonacion = async (req, res, next) => {
    try {
        const donacion = await obtenerDonacionPorId(req.params.id);
        if (!donacion) throw donacionNoEncontrada();
        res.render("donacionEliminar", { donacion });
    } catch (error) {
        next(error);
    }
};

const eliminarDonacionVista = async (req, res, next) => {
    try {
        const donacion = await eliminarDonacion(req.params.id);
        if (!donacion) throw donacionNoEncontrada();
        res.redirect("/vistas/donaciones");
    } catch (error) {
        next(error);
    }
};

const renderDonantes = async   (req, res) => {
    try {
        // REEMPLAZO: En lugar de fs.readFileSync, llamamos a la función del servicio
        const donantes = await obtenerDonantes();
        res.render("donantes", { donantes });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al cargar donantes");
    }
};

const renderCrearDonante = (req, res) => {
    res.render("donantesCrear");
};

const guardarDonanteDesdeVista = async (req, res) => {
    try {
      await insertarDonante(req.body);
        res.redirect("/vistas/donantes");
    } catch (error) {
        //---------
        console.error("ERROR AL GUARDAR DONANTE:", error);
        res.status(500).send("Error al guardar el donante");
    }
};

export {
    renderHome,
    renderProyectos,
    renderCrearProyecto,
    guardarProyectoDesdeVista,
    renderProyectoDetalle,
    renderEditarProyecto,
    guardarEdicionProyecto,
    renderEliminarProyecto,
    eliminarProyectoVista,
    renderOrganizaciones,
    renderCrearOrganizacion,
    guardarOrganizacionDesdeVista,
    renderOrganizacionDetalle,
    renderEditarOrganizacion,
    guardarEdicionOrganizacion,
    renderEliminarOrganizacion,
    eliminarOrganizacionVista,
    renderGastos,
    renderCrearGasto,
    guardarGastoDesdeVista,
    renderDonaciones,
    renderCrearDonacion,
    guardarDonacionDesdeVista,
    renderDonacionDetalle,
    renderEditarDonacion,
    guardarEdicionDonacion,
    renderEliminarDonacion,
    eliminarDonacionVista,
    renderDonantes,
    renderCrearDonante,
    guardarDonanteDesdeVista
};
