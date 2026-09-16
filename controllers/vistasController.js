const fs = require("fs");
const path = require("path");
const Proyecto = require("../models/Proyectos");
const Organizacion = require("../models/Organizaciones");
const Donante = require("../models/Donantes");

const proyectosPath = path.join(__dirname, "../data/proyectos.json");
const organizacionesPath = path.join(__dirname, "../data/organizaciones.json");
const gastosPath = path.join(__dirname, "../data/gastos.json");
const donacionesPath = path.join(__dirname, "../data/donaciones.json");
const donantesPath = path.join(__dirname, "../data/donantes.json");

const renderHome = (req, res) => {
    res.render("index", { titulo: "Panel Principal - Backend" });
};

const renderProyectos = (req, res) => {
    try {
        const proyectos = JSON.parse(fs.readFileSync(proyectosPath, "utf-8"));
        res.render("proyectos", { proyectos });
    } catch (error) {
        res.status(500).send("Error al cargar proyectos");
    }
};

const renderCrearProyecto = (req, res) => {
    res.render("proyectosCrear");
};

const guardarProyectoDesdeVista = (req, res) => {
    try {
        const { idOrganizacion, nomProyecto, descripcion, saldo } = req.body;
        const proyectos = JSON.parse(fs.readFileSync(proyectosPath, "utf-8"));
        const nuevoId = proyectos.length > 0 ? Math.max(...proyectos.map(p => p.idProyecto)) + 1 : 1;
        const nuevoProyecto = new Proyecto(
            nuevoId,
            Number(idOrganizacion),
            nomProyecto,
            descripcion,
            Number(saldo)
        );
        proyectos.push(nuevoProyecto);
        fs.writeFileSync(proyectosPath, JSON.stringify(proyectos, null, 2), "utf-8");
        res.redirect("/vistas/proyectos");
    } catch (error) {
        res.status(500).send("Error al guardar el proyecto");
    }
};

const renderProyectoDetalle = (req, res) => {
    try {
        const id = Number(req.params.id);
        const proyectos = JSON.parse(fs.readFileSync(proyectosPath, "utf-8"));
        const proyecto = proyectos.find(p => p.idProyecto === id);
        if (!proyecto) {
            return res.status(404).render("error", { mensaje: "Proyecto no encontrado" });
        }
        res.render("proyectoDetalle", { proyecto });
    } catch (error) {
        res.status(500).send("Error al cargar el detalle del proyecto");
    }
};

const renderOrganizaciones = (req, res) => {
    try {
        const organizaciones = JSON.parse(fs.readFileSync(organizacionesPath, "utf-8"));
        res.render("organizaciones", { organizaciones });
    } catch (error) {
        res.status(500).send("Error al cargar organizaciones");
    }
};

const renderCrearOrganizacion = (req, res) => {
    res.render("organizacionesCrear");
};

const guardarOrganizacionDesdeVista = (req, res) => {
    try {
        const { nombre, tipo, cuil, telefono, mail, direccion, responsable } = req.body;
        const organizaciones = JSON.parse(fs.readFileSync(organizacionesPath, "utf-8"));
        const nuevoId = organizaciones.length > 0 ? Math.max(...organizaciones.map(o => o.idOrganizacion)) + 1 : 1;
        const nuevaOrg = new Organizacion(
            nuevoId,
            nombre,
            tipo,
            cuil,
            telefono,
            mail,
            direccion,
            responsable
        );
        organizaciones.push(nuevaOrg);
        fs.writeFileSync(organizacionesPath, JSON.stringify(organizaciones, null, 2), "utf-8");
        res.redirect("/vistas/organizaciones");
    } catch (error) {
        res.status(500).send("Error al guardar la organización");
    }
};

const renderGastos = (req, res) => {
    try {
        const gastos = JSON.parse(fs.readFileSync(gastosPath, "utf-8"));
        res.render("gastos", { gastos });
    } catch (error) {
        res.status(500).send("Error al cargar gastos");
    }
};

const renderDonaciones = (req, res) => {
    try {
        const donaciones = JSON.parse(fs.readFileSync(donacionesPath, "utf-8"));
        res.render("donaciones", { donaciones });
    } catch (error) {
        res.status(500).send("Error al cargar donaciones");
    }
};

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

module.exports = {
    renderHome,
    renderProyectos,
    renderCrearProyecto,
    guardarProyectoDesdeVista,
    renderProyectoDetalle,
    renderOrganizaciones,
    renderCrearOrganizacion,
    guardarOrganizacionDesdeVista,
    renderGastos,
    renderDonaciones,
    renderDonantes,
    renderCrearDonante,
    guardarDonanteDesdeVista
};
