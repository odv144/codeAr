import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Modelos (clases simples) que todavía se usan con archivos JSON
import Donante from "../models/Donantes.js";
import Donacion from "../models/Donaciones.js";
import Gasto from "../models/Gastos.js";

// Servicios con MongoDB
import { obtenerProyectosId, insertarProyecto, obtenerProyectos } from "../services/serviceProyecto.js";
import { obtenerOrganizaciones, crearOrganizacion } from "../services/serviceOrganizacion.js";
import { validarDatosOrganizacion } from "../utils/validacionesOrganizacion.js";
import { AppError } from "../utils/AppError.js";

// Rutas de los JSON (organizaciones y proyectos ya NO se leen de acá)
const gastosPath = path.join(__dirname, "../data/gastos.json");
const donacionesPath = path.join(__dirname, "../data/donaciones.json");
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

const renderProyectoDetalle = async (req, res) => {
    try {
        const id = req.params.id;
        const proyecto = await obtenerProyectosId(id);
        if (!proyecto) {
            return res.status(404).render("error", { mensaje: "Proyecto no encontrado" });
        }
        res.render("proyectoDetalle", { proyecto });
    } catch (error) {
        if (error.message === "Proyecto no encontrado") {
            return res.status(404).render("error", { mensaje: "Proyecto no encontrado" });
        }
        res.status(500).send("Error al cargar el detalle del proyecto");
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


/* ===================== GASTOS (JSON) ===================== */

const renderGastos = (req, res) => {
    try {
        const gastos = JSON.parse(fs.readFileSync(gastosPath, "utf-8"));
        res.render("gastos", { gastos });
    } catch (error) {
        res.status(500).send("Error al cargar gastos");
    }
};

const renderCrearGasto = (req, res) => {
    res.render("gastosCrear");
};

const guardarGastoDesdeVista = (req, res) => {
    try {
        const { idProyecto, descripcion, monto, fecha } = req.body;
        const gastos = JSON.parse(fs.readFileSync(gastosPath, "utf-8"));
        const nuevoId = gastos.length > 0 ? Math.max(...gastos.map(g => g.idGasto)) + 1 : 1;
        const nuevoGasto = new Gasto(
            nuevoId,
            Number(idProyecto),
            descripcion,
            Number(monto),
            fecha
        );
        gastos.push(nuevoGasto);
        fs.writeFileSync(gastosPath, JSON.stringify(gastos, null, 2), "utf-8");
        res.redirect("/vistas/gastos");
    } catch (error) {
        res.status(500).send("Error al guardar el gasto");
    }
};


/* ===================== DONACIONES (JSON) ===================== */

const renderDonaciones = (req, res) => {
    try {
        const donaciones = JSON.parse(fs.readFileSync(donacionesPath, "utf-8"));
        res.render("donaciones", { donaciones });
    } catch (error) {
        res.status(500).send("Error al cargar donaciones");
    }
};

const renderCrearDonacion = (req, res) => {
    res.render("donacionesCrear");
};

const guardarDonacionDesdeVista = (req, res) => {
    try {
        const { monto, cbu, fecha, idProyecto, idDonante, idOrganizacion } = req.body;
        const donaciones = JSON.parse(fs.readFileSync(donacionesPath, "utf-8"));
        const nuevoId = donaciones.length > 0 ? Math.max(...donaciones.map(d => d.idDonacion)) + 1 : 1;
        const nuevaDonacion = new Donacion(
            nuevoId,
            Number(monto),
            cbu,
            fecha,
            Number(idProyecto),
            Number(idDonante),
            Number(idOrganizacion)
        );
        donaciones.push(nuevaDonacion);
        fs.writeFileSync(donacionesPath, JSON.stringify(donaciones, null, 2), "utf-8");
        res.redirect("/vistas/donaciones");
    } catch (error) {
        res.status(500).send("Error al guardar la donación");
    }
};


/* ===================== DONANTES (JSON) ===================== */

const renderDonantes = (req, res) => {
    try {
        const donantes = JSON.parse(fs.readFileSync(donantesPath, "utf-8"));
        res.render("donantes", { donantes });
    } catch (error) {
        res.status(500).send("Error al cargar donantes");
    }
};

const renderCrearDonante = (req, res) => {
    res.render("donantesCrear");
};

const guardarDonanteDesdeVista = (req, res) => {
    try {
        const { nombre, apellido, dni, telefono, email, monto, fecha } = req.body;
        const donantes = JSON.parse(fs.readFileSync(donantesPath, "utf-8"));
        const nuevoId = donantes.length > 0 ? Math.max(...donantes.map(d => d.idDonante)) + 1 : 1;
        const nuevoDonante = new Donante(
            nuevoId,
            nombre,
            apellido,
            dni,
            telefono,
            email,
            Number(monto),
            fecha
        );
        donantes.push(nuevoDonante);
        fs.writeFileSync(donantesPath, JSON.stringify(donantes, null, 2), "utf-8");
        res.redirect("/vistas/donantes");
    } catch (error) {
        res.status(500).send("Error al guardar el donante");
    }
};

export {
    renderHome,
    renderProyectos,
    renderCrearProyecto,
    guardarProyectoDesdeVista,
    renderProyectoDetalle,
    renderOrganizaciones,
    renderCrearOrganizacion,
    guardarOrganizacionDesdeVista,
    renderGastos,
    renderCrearGasto,
    guardarGastoDesdeVista,
    renderDonaciones,
    renderCrearDonacion,
    guardarDonacionDesdeVista,
    renderDonantes,
    renderCrearDonante,
    guardarDonanteDesdeVista
};
