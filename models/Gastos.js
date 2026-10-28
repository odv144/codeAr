import mongoose from "mongoose";

// Esquema de Gasto: define los campos y valida los datos antes de guardarlos en MongoDB
const gastoSchema = new mongoose.Schema(
  {
    // Proyecto al que se imputa el gasto: _id (ObjectId) del proyecto. La identidad del gasto es su propio _id.
    idProyecto: { type: mongoose.Schema.Types.ObjectId, ref: "Proyectos", required: [true, "El campo 'idProyecto' es obligatorio"] },
    descripcion: { type: String, required: [true, "El campo 'descripcion' es obligatorio"], trim: true, minlength: [3, "La descripción debe tener al menos 3 caracteres"], maxlength: [200, "La descripción no puede superar los 200 caracteres"] },
    // Mayor a 0. El tope contra el saldo disponible se valida en el servicio, no acá
    monto: { type: Number, required: [true, "El campo 'monto' es obligatorio"], min: [0.01, "El monto debe ser mayor a 0"] },
    fecha: { type: Date, required: [true, "El campo 'fecha' es obligatorio"] }
  },
  {
    // Nombre fijo de la colección
    collection: "gastos",
    versionKey: false
  }
);

export default mongoose.model("Gasto", gastoSchema);