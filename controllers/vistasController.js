const fs = require("fs");
const path = require("path");

const proyectosPath = path.join(__dirname, "../data/proyectos.json");
const organizacionesPath = path.join(__dirname, "../data/organizaciones.json");
const gastosPath = path.join(__dirname, "../data/gastos.json");
const donacionesPath = path.join(__dirname, "../data/donaciones.json");

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

const renderProyectoDetalle = (req, res) => {
    try {
        const id = Number(req.params.id);
        const proyectos = JSON.parse(fs.readFileSync(proyectosPath, "utf-8"));
        const proyecto = proyectos.find(p => p.id === id);
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

module.exports = {
    renderHome,
    renderProyectos,
    renderProyectoDetalle,
    renderOrganizaciones,
    renderGastos,
    renderDonaciones
};
