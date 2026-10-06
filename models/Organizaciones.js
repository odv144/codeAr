import mongoose from "mongoose";

// Patrones y longitudes compartidos con las validaciones de la capa de entrada
// (utils/validacionesOrganizacion.js), así hay una única fuente de verdad.
export const PATRONES = {
  cuil: /^\d{2}-\d{8}-\d$/,              // 30-71234567-8
  mail: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,    // algo@dominio.ext
  telefono: /^[0-9+\-()\s]{6,20}$/       // 341-5551234, +54 341 555-1234
};

export const LONGITUD = {
  nombre: { min: 2, max: 100 },
  tipo: { min: 2, max: 50 },
  direccion: { min: 3, max: 150 },
  responsable: { min: 2, max: 100 }
};

const texto = (campo, etiqueta) => ({
  type: String,
  required: [true, `El campo '${campo}' es obligatorio`],
  trim: true,
  minlength: [LONGITUD[campo].min, `${etiqueta} debe tener al menos ${LONGITUD[campo].min} caracteres`],
  maxlength: [LONGITUD[campo].max, `${etiqueta} no puede superar los ${LONGITUD[campo].max} caracteres`]
});

const organizacionSchema = new mongoose.Schema(
  {
    // Clave de negocio numérica: la usan Proyectos y Donaciones (idOrganizacion)
    idOrganizacion: { type: Number, required: true, unique: true, min: 1 },
    nombre: texto("nombre", "El nombre"),
    tipo: texto("tipo", "El tipo"),
    cuil: {
      type: String,
      required: [true, "El campo 'cuil' es obligatorio"],
      unique: true,
      trim: true,
      match: [PATRONES.cuil, "El CUIL debe tener el formato XX-XXXXXXXX-X (ej. 30-71234567-8)"]
    },
    telefono: {
      type: String,
      required: [true, "El campo 'telefono' es obligatorio"],
      trim: true,
      match: [PATRONES.telefono, "El teléfono solo puede tener números, espacios, +, - y paréntesis (6 a 20 caracteres)"]
    },
    mail: {
      type: String,
      required: [true, "El campo 'mail' es obligatorio"],
      trim: true,
      lowercase: true,
      match: [PATRONES.mail, "El mail no tiene un formato válido"]
    },
    direccion: texto("direccion", "La dirección"),
    responsable: texto("responsable", "El responsable"),

    // Baja lógica: la organización no se borra de la base, se marca como inactiva.
    // Así se conserva el historial y los proyectos/donaciones que la referencian.
    activa: { type: Boolean, default: true },
    fechaBaja: { type: Date, default: null }
  },
  {
    collection: "organizaciones",
    versionKey: false,
    toJSON: {
      // No exponemos el _id interno de Mongo: la API trabaja con idOrganizacion
      transform: (_doc, ret) => {
        delete ret._id;
        return ret;
      }
    }
  }
);

export default mongoose.model("Organizacion", organizacionSchema);
