import mongoose from "mongoose";

const donacionSchema = new mongoose.Schema(
    {
        monto: {
            type: Number,
            required: [true, "El campo 'monto' es obligatorio"],
            min: [0.01, "El monto debe ser mayor a 0"]
        },
        cbu: {
            type: String,
            required: [true, "El campo 'cbu' es obligatorio"],
            trim: true,
            match: [/^\d{22}$/, "El CBU debe tener 22 dígitos numéricos"]
        },
        fecha: {
            type: Date,
            required: [true, "El campo 'fecha' es obligatorio"]
        },
        
        idProyecto: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Proyectos",
            required: [true, "El campo 'idProyecto' es obligatorio"]
        },
        idDonante: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Donante",
            required: [true, "El campo 'idDonante' es obligatorio"]
        },
        idOrganizacion: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organizacion",
            required: [true, "El campo 'idOrganizacion' es obligatorio"]
        }
    },
    {
        collection: "donaciones",
        versionKey: false
    }
);

export default mongoose.model("Donacion", donacionSchema);