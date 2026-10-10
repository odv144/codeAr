import mongoose from "mongoose";

const donacionSchema = new mongoose.Schema(
    {
        idDonacion: {
            type: Number,
            required: [true, "El campo 'idDonacion' es obligatorio"],
            unique: true,
            min: 1
        },
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
            type: Number,
            required: [true, "El campo 'idProyecto' es obligatorio"],
            min: 1
        },
        idDonante: {
            type: Number,
            required: [true, "El campo 'idDonante' es obligatorio"],
            min: 1
        },
        idOrganizacion: {
            type: Number,
            required: [true, "El campo 'idOrganizacion' es obligatorio"],
            min: 1
        }
    },
    {

        collection: "donaciones",
        versionKey: false,

        toJSON: {
            transform: (_doc, ret) => {
                delete ret._id;
                return ret;
            }
        }
    }
);

export default mongoose.model("Donacion", donacionSchema);