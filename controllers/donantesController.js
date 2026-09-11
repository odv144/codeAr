const fs = require("fs");
const path = require("path");
const Donante = require("../models/Donantes");

const archivo = path.join(__dirname, "../data/donantes.json");

function leerDonantes() {
    const datos = fs.readFileSync(archivo, "utf-8");
    return JSON.parse(datos);
}

function guardarDonantes(donantes) {
    fs.writeFileSync(
        archivo,
        JSON.stringify(donantes, null, 2)
    );
}

// GET ALL
const obtenerDonantes = (req, res) => {
    try {
        const donantes = leerDonantes();

        res.status(200).json(donantes);

    } catch (error) {
        res.status(500).json({
            mensaje: "Error al obtener los donantes"
        });
    }
};

// GET BY ID
const obtenerDonantePorId = (req, res) => {
    try {
        const id = Number(req.params.id);

        const donantes = leerDonantes();

        const donante = donantes.find(
            d => d.idDonante === id
        );

        if (!donante) {
            return res.status(404).json({
                mensaje: "Donante no encontrado"
            });
        }

        res.status(200).json(donante);

    } catch (error) {
        res.status(500).json({
            mensaje: "Error al obtener el donante"
        });
    }
};

// CREATE
const crearDonante = (req, res) => {
    try {
        const {
            nombre,
            apellido,
            dni,
            telefono,
            email,
            monto,
            fecha
        } = req.body;

        if (
            !nombre ||
            !apellido ||
            !dni ||
            !telefono ||
            !email ||
            !monto ||
            !fecha
        ) {
            return res.status(400).json({
                mensaje: "Todos los campos son obligatorios"
            });
        }

        const donantes = leerDonantes();

        // Validamos que no exista otro donante con el mismo DNI
        const existeDni = donantes.some(
            d => d.dni === dni
        );

        if (existeDni) {
            return res.status(409).json({
                mensaje: "Ya existe un donante con ese DNI"
            });
        }

        const nuevoId =
            donantes.length > 0
                ? Math.max(
                    ...donantes.map(d => d.idDonante)
                ) + 1
                : 1;

        const nuevoDonante = new Donante(
            nuevoId,
            nombre,
            apellido,
            dni,
            telefono,
            email,
            monto,
            fecha
        );

        donantes.push(nuevoDonante);

        guardarDonantes(donantes);

        res.status(201).json(nuevoDonante);

    } catch (error) {
        res.status(500).json({
            mensaje: "Error al crear el donante"
        });
    }
};

// UPDATE
const actualizarDonante = (req, res) => {
    try {
        const id = Number(req.params.id);

        const {
            nombre,
            apellido,
            dni,
            telefono,
            email,
            monto,
            fecha
        } = req.body;

        const donantes = leerDonantes();

        const indice = donantes.findIndex(
            d => d.idDonante === id
        );

        if (indice === -1) {
            return res.status(404).json({
                mensaje: "Donante no encontrado"
            });
        }

        if (
            !nombre ||
            !apellido ||
            !dni ||
            !telefono ||
            !email ||
            !monto ||
            !fecha
        ) {
            return res.status(400).json({
                mensaje: "Todos los campos son obligatorios"
            });
        }

        // Validamos que el nuevo DNI no pertenezca ya a otro donante distinto
        const existeDni = donantes.some(
            d =>
                d.dni === dni &&
                d.idDonante !== id
        );

        if (existeDni) {
            return res.status(409).json({
                mensaje: "El DNI ya pertenece a otro donante"
            });
        }

        donantes[indice] = new Donante(
            id,
            nombre,
            apellido,
            dni,
            telefono,
            email,
            monto,
            fecha
        );

        guardarDonantes(donantes);

        res.status(200).json(donantes[indice]);

    } catch (error) {
        res.status(500).json({
            mensaje: "Error al actualizar el donante"
        });
    }
};

// DELETE
const eliminarDonante = (req, res) => {
    try {
        const id = Number(req.params.id);

        const donantes = leerDonantes();

        const indice = donantes.findIndex(
            d => d.idDonante === id
        );

        if (indice === -1) {
            return res.status(404).json({
                mensaje: "Donante no encontrado"
            });
        }

        const eliminado = donantes.splice(indice, 1);

        guardarDonantes(donantes);

        res.status(200).json({
            mensaje: "Donante eliminado correctamente",
            donante: eliminado[0]
        });

    } catch (error) {
        res.status(500).json({
            mensaje: "Error al eliminar el donante"
        });
    }
};

module.exports = {
    obtenerDonantes,
    obtenerDonantePorId,
    crearDonante,
    actualizarDonante,
    eliminarDonante
};