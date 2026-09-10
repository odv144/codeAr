const fs = require("fs");
const path = require("path");
const Gasto = require("../models/Gastos");

const archivo = path.join(__dirname, "../data/gastos.json");


function leerGastos() {
    const datos = fs.readFileSync(archivo, "utf-8");
    return JSON.parse(datos);
}

function guardarGastos(gastos) {
    fs.writeFileSync(
        archivo,
        JSON.stringify(gastos, null, 2)
    );
}


// GET ALL
const obtenerGastos = (req, res) => {
    try {
        const gastos = leerGastos();

        res.status(200).json(gastos);

    } catch (error) {
        res.status(500).json({
            mensaje: "Error al obtener los gastos"
        });
    }
};


// GET BY ID
const obtenerGastoPorId = (req, res) => {
    try {
        const id = Number(req.params.id);

        const gastos = leerGastos();

        const gasto = gastos.find(
            g => g.idGasto === id
        );

        if (!gasto) {
            return res.status(404).json({
                mensaje: "Gasto no encontrado"
            });
        }

        res.status(200).json(gasto);

    } catch (error) {
        res.status(500).json({
            mensaje: "Error al obtener el gasto"
        });
    }
};


// CREATE
const crearGasto = (req, res) => {
    try {

        const {
            idProyecto,
            descripcion,
            monto,
            fecha
        } = req.body;

        if (
            !idProyecto ||
            !descripcion ||
            monto === undefined ||
            monto === null ||
            !fecha
        ) {
            return res.status(400).json({
                mensaje: "Todos los campos son obligatorios"
            });
        }

        if (
            typeof idProyecto !== "number" ||
            typeof descripcion !== "string" ||
            typeof monto !== "number" ||
            isNaN(monto) ||
            typeof fecha !== "string"
        ) {
            return res.status(400).json({
                mensaje: "Tipo de dato inválido en alguno de los campos"
            });
        }

        const gastos = leerGastos();

        // TODO: validar que el gasto no supere el saldo disponible del proyecto (pendiente de confirmar si se necesita para esta entrega)

        const nuevoId =
            gastos.length > 0
                ? Math.max(
                    ...gastos.map(g => g.idGasto)
                ) + 1
                : 1;

        const nuevoGasto = new Gasto(
            nuevoId,
            idProyecto,
            descripcion,
            monto,
            fecha
        );

        gastos.push(nuevoGasto);

        guardarGastos(gastos);

        res.status(201).json(nuevoGasto);

    } catch (error) {

        res.status(500).json({
            mensaje: "Error al crear el gasto"
        });

    }
};

// UPDATE
const actualizarGasto = (req, res) => {
    try {

        const id = Number(req.params.id);

        const {
            idProyecto,
            descripcion,
            monto,
            fecha
        } = req.body;

        const gastos = leerGastos();

        const indice = gastos.findIndex(
            g => g.idGasto === id
        );

        if (indice === -1) {
            return res.status(404).json({
                mensaje: "Gasto no encontrado"
            });
        }

        if (
            !idProyecto ||
            !descripcion ||
            monto === undefined ||
            monto === null ||
            !fecha
        ) {
            return res.status(400).json({
                mensaje: "Todos los campos son obligatorios"
            });
        }

        if (
            typeof idProyecto !== "number" ||
            typeof descripcion !== "string" ||
            typeof monto !== "number" ||
            isNaN(monto) ||
            typeof fecha !== "string"
        ) {
            return res.status(400).json({
                mensaje: "Tipo de dato inválido en alguno de los campos"
            });
        }

        gastos[indice] = new Gasto(
            id,
            idProyecto,
            descripcion,
            monto,
            fecha
        );

        guardarGastos(gastos);

        res.status(200).json(gastos[indice]);

    } catch (error) {

        res.status(500).json({
            mensaje: "Error al actualizar el gasto"
        });

    }
};


// DELETE
const eliminarGasto = (req, res) => {
    try {

        const id = Number(req.params.id);

        const gastos = leerGastos();

        const indice = gastos.findIndex(
            g => g.idGasto === id
        );

        if (indice === -1) {
            return res.status(404).json({
                mensaje: "Gasto no encontrado"
            });
        }

        const eliminado = gastos.splice(indice, 1);

        guardarGastos(gastos);

        res.status(200).json({
            mensaje: "Gasto eliminado correctamente",
            gasto: eliminado[0]
        });

    } catch (error) {

        res.status(500).json({
            mensaje: "Error al eliminar el gasto"
        });

    }
};

module.exports = {

    obtenerGastos,
    obtenerGastoPorId,
    crearGasto,
    actualizarGasto,
    eliminarGasto

};
