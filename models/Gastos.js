import mongoose from "mongoose";
 
const gastoSchema = new mongoose.Schema(
 {
    // Clave de negocio numérica: la usan los endpoints y las vistas
    idGasto: { type: Number, required: [true, "El campo 'idGasto' es obligatorio"], unique: true, min: 1 },
    idProyecto: { type: Number, required: [true, "El campo 'idProyecto' es obligatorio"], min: 1 },
    descripcion: { type: String, required: [true, "El campo 'descripcion' es obligatorio"], trim: true, minlength: [3, "La descripción debe tener al menos 3 caracteres"], maxlength: [200, "La descripción no puede superar los 200 caracteres"] },
    // Mayor a 0. El tope contra el saldo disponible se valida en el servicio, no acá
    monto: { type: Number, required: [true, "El campo 'monto' es obligatorio"], min: [0.01, "El monto debe ser mayor a 0"] },
    fecha: { type: Date, required: [true, "El campo 'fecha' es obligatorio"] }
 },
 {
    // Nombre fijo de la colección, para que Mongoose no lo deduzca del nombre del modelo
    collection: "gastos",
    versionKey: false,
    // No exponemos el _id interno de Mongo: la API trabaja con idGasto
    toJSON: {
      transform: (_doc, ret) => {
        delete ret._id;
        return ret;
      }
    }
 }
);

export default mongoose.model("Gasto", gastoSchema);