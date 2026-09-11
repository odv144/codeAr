const fs = require("fs");
const path = require("path");
const Donacion = require("../models/Donaciones");

const archivo = path.join(__dirname, "../data/donaciones.json");
const archivoProyectos = path.join(__dirname, "../data/proyectos.json");
const archivoOrganizaciones = path.join(__dirname, "../data/organizaciones.json");


function leerDonaciones() {
    const datos = fs.readFileSync(archivo, "utf-8");
    return JSON.parse(datos);
}

function guardarDonaciones(donaciones) {
    fs.writeFileSync(
        archivo,
        JSON.stringify(donaciones, null, 2)
    );
}

function existeProyecto(idProyecto) {
    const proyectos = JSON.parse(fs.readFileSync(archivoProyectos, "utf-8"));
    return proyectos.some(p => p.id === idProyecto);
}

function existeOrganizacion(idOrganizacion) {
    const organizaciones = JSON.parse(fs.readFileSync(archivoOrganizaciones, "utf-8"));
    return organizaciones.some(o => o.idOrganizacion === idOrganizacion);
}


const obtenerDonaciones = (req, res) => {
    try {
        const donaciones = leerDonaciones();
        res.status(200).json(donaciones);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener las donaciones" });
    }
};


const obtenerDonacionPorId = (req, res) => {
    try {
        const id = Number(req.params.id);
        const donaciones = leerDonaciones();
        const donacion = donaciones.find(d => d.idDonacion === id);

        if (!donacion) {
            return res.status(404).json({ mensaje: "Donación no encontrada" });
        }

        res.status(200).json(donacion);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener la donación" });
    }
};


const crearDonacion = (req, res) => {
    try {
        const { monto, cbu, fecha, idProyecto, idDonante, idOrganizacion } = req.body;

        if (!monto || !cbu || !fecha || !idProyecto || !idDonante || !idOrganizacion) {
            return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
        }

        if (typeof monto !== "number" || monto <= 0) {
            return res.status(400).json({ mensaje: "El monto debe ser un número mayor a 0" });
        }

        if (!existeProyecto(idProyecto)) {
            return res.status(404).json({ mensaje: "El proyecto indicado no existe" });
        }

        if (!existeOrganizacion(idOrganizacion)) {
            return res.status(404).json({ mensaje: "La organización indicada no existe" });
        }

        const donaciones = leerDonaciones();

        const nuevoId = donaciones.length > 0
            ? Math.max(...donaciones.map(d => d.idDonacion)) + 1
            : 1;

        const nuevaDonacion = new Donacion(nuevoId, monto, cbu, fecha, idProyecto, idDonante, idOrganizacion);

        donaciones.push(nuevaDonacion);
        guardarDonaciones(donaciones);

        res.status(201).json(nuevaDonacion);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al crear la donación" });
    }
};


const actualizarDonacion = (req, res) => {
    try {
        const id = Number(req.params.id);
        const { monto, cbu, fecha, idProyecto, idDonante, idOrganizacion } = req.body;

        const donaciones = leerDonaciones();
        const indice = donaciones.findIndex(d => d.idDonacion === id);

        if (indice === -1) {
            return res.status(404).json({ mensaje: "Donación no encontrada" });
        }

        if (!monto || !cbu || !fecha || !idProyecto || !idDonante || !idOrganizacion) {
            return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
        }

        if (typeof monto !== "number" || monto <= 0) {
            return res.status(400).json({ mensaje: "El monto debe ser un número mayor a 0" });
        }

        if (!existeProyecto(idProyecto)) {
            return res.status(404).json({ mensaje: "El proyecto indicado no existe" });
        }

        if (!existeOrganizacion(idOrganizacion)) {
            return res.status(404).json({ mensaje: "La organización indicada no existe" });
        }

        donaciones[indice] = new Donacion(id, monto, cbu, fecha, idProyecto, idDonante, idOrganizacion);

        guardarDonaciones(donaciones);

        res.status(200).json(donaciones[indice]);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al actualizar la donación" });
    }
};


const eliminarDonacion = (req, res) => {
    try {
        const id = Number(req.params.id);
        const donaciones = leerDonaciones();
        const indice = donaciones.findIndex(d => d.idDonacion === id);

        if (indice === -1) {
            return res.status(404).json({ mensaje: "Donación no encontrada" });
        }

        const eliminada = donaciones.splice(indice, 1);
        guardarDonaciones(donaciones);

        res.status(200).json({ mensaje: "Donación eliminada correctamente", donacion: eliminada[0] });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar la donación" });
    }
};

module.exports = {
    obtenerDonaciones,
    obtenerDonacionPorId,
    crearDonacion,
    actualizarDonacion,
    eliminarDonacion
};