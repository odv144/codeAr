import { 
  obtenerDonantes, 
  obtenerDonantesId, 
  insertarDonante, 
  actualizarDonante, 
  eliminarDonante 
} from "../services/serviceDonante.js";

// GET ALL
const listarDonantes = async (req, res) => {
  try {
    const donantes = await obtenerDonantes();
    res.status(200).json(donantes);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener los donantes", error: error.message });
  }
};

// GET BY ID
const obtenerDonantePorId = async (req, res) => {
  try {
    const { id } = req.params;
    const donante = await obtenerDonantesId(id);
    res.status(200).json(donante);
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ mensaje: error.message });
  }
};

// CREATE
const crearDonante = async (req, res) => {
  try {
    const nuevoDonante = await insertarDonante(req.body);
    res.status(201).json({ mensaje: "Donante creado con éxito", donante: nuevoDonante });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ mensaje: "Error al crear el donante", error: error.message });
  }
};

// UPDATE
const modificarDonante = async (req, res) => {
  try {
    const { id } = req.params;
    const donanteActualizado = await actualizarDonante(id, req.body);
    res.status(200).json({ mensaje: "Donante actualizado", donante: donanteActualizado });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ mensaje: "Error al actualizar", error: error.message });
  }
};

// DELETE
const borrarDonante = async (req, res) => {
  try {
    const { id } = req.params;
    await eliminarDonante(id);
    res.status(200).json({ mensaje: "Donante eliminado correctamente" });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ mensaje: error.message });
  }
};

export { listarDonantes, obtenerDonantePorId, crearDonante, modificarDonante, borrarDonante };