const fs = require("fs");
const path = require("path");
const Organizacion = require("../models/Organizaciones");

const archivo = path.join(__dirname, "../data/organizaciones.json");


function leerOrganizaciones() {
    const datos = fs.readFileSync(archivo, "utf-8");
    return JSON.parse(datos);
}

function guardarOrganizaciones(organizaciones) {
    fs.writeFileSync(
        archivo,
        JSON.stringify(organizaciones, null, 2)
    );
}


// GET ALL
const obtenerOrganizaciones = (req, res) => {
    try {
        const organizaciones = leerOrganizaciones();

        res.status(200).json(organizaciones);

    } catch (error) {
        res.status(500).json({
            mensaje: "Error al obtener las organizaciones"
        });
    }
};


// GET BY ID
const obtenerOrganizacionPorId = (req, res) => {
    try {
        const id = Number(req.params.id);

        const organizaciones = leerOrganizaciones();

        const organizacion = organizaciones.find(
            o => o.idOrganizacion === id
        );

        if (!organizacion) {
            return res.status(404).json({
                mensaje: "Organización no encontrada"
            });
        }

        res.status(200).json(organizacion);

    } catch (error) {
        res.status(500).json({
            mensaje: "Error al obtener la organización"
        });
    }
};


// CREATE
const crearOrganizacion = (req, res) => {
    try {

        const {
            nombre,
            tipo,
            cuil,
            telefono,
            mail,
            direccion,
            responsable
        } = req.body;

        if (
            !nombre ||
            !tipo ||
            !cuil ||
            !telefono ||
            !mail ||
            !direccion ||
            !responsable
        ) {
            return res.status(400).json({
                mensaje: "Todos los campos son obligatorios"
            });
        }

        const organizaciones = leerOrganizaciones();

        const existeCuil = organizaciones.some(
            o => o.cuil === cuil
        );

        if (existeCuil) {
            return res.status(409).json({
                mensaje: "Ya existe una organización con ese CUIL"
            });
        }

        const nuevoId =
            organizaciones.length > 0
                ? Math.max(
                    ...organizaciones.map(o => o.idOrganizacion)
                ) + 1
                : 1;

        const nuevaOrganizacion = new Organizacion(
            nuevoId,
            nombre,
            tipo,
            cuil,
            telefono,
            mail,
            direccion,
            responsable
        );

        organizaciones.push(nuevaOrganizacion);

        guardarOrganizaciones(organizaciones);

        res.status(201).json(nuevaOrganizacion);

    } catch (error) {

        res.status(500).json({
            mensaje: "Error al crear la organización"
        });

    }
};

// UPDATE
const actualizarOrganizacion = (req, res) => {
    try {

        const id = Number(req.params.id);

        const {
            nombre,
            tipo,
            cuil,
            telefono,
            mail,
            direccion,
            responsable
        } = req.body;

        const organizaciones = leerOrganizaciones();

        const indice = organizaciones.findIndex(
            o => o.idOrganizacion === id
        );

        if (indice === -1) {
            return res.status(404).json({
                mensaje: "Organización no encontrada"
            });
        }

        if (
            !nombre ||
            !tipo ||
            !cuil ||
            !telefono ||
            !mail ||
            !direccion ||
            !responsable
        ) {
            return res.status(400).json({
                mensaje: "Todos los campos son obligatorios"
            });
        }

        const existeCuil = organizaciones.some(
            o =>
                o.cuil === cuil &&
                o.idOrganizacion !== id
        );

        if (existeCuil) {
            return res.status(409).json({
                mensaje: "El CUIL ya pertenece a otra organización"
            });
        }

        organizaciones[indice] = new Organizacion(
            id,
            nombre,
            tipo,
            cuil,
            telefono,
            mail,
            direccion,
            responsable
        );

        guardarOrganizaciones(organizaciones);

        res.status(200).json(organizaciones[indice]);

    } catch (error) {

        res.status(500).json({
            mensaje: "Error al actualizar la organización"
        });

    }
};


// DELETE
const eliminarOrganizacion = (req, res) => {
    try {

        const id = Number(req.params.id);

        const organizaciones = leerOrganizaciones();

        const indice = organizaciones.findIndex(
            o => o.idOrganizacion === id
        );

        if (indice === -1) {
            return res.status(404).json({
                mensaje: "Organización no encontrada"
            });
        }

        const eliminada = organizaciones.splice(indice, 1);

        guardarOrganizaciones(organizaciones);

        res.status(200).json({
            mensaje: "Organización eliminada correctamente",
            organizacion: eliminada[0]
        });

    } catch (error) {

        res.status(500).json({
            mensaje: "Error al eliminar la organización"
        });

    }
};

module.exports = {

    obtenerOrganizaciones,
    obtenerOrganizacionPorId,
    crearOrganizacion,
    actualizarOrganizacion,
    eliminarOrganizacion

};
