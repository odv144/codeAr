import mongoose from "mongoose";
const proyectoSchema = new mongoose.Schema({
    // Clave foránea: ObjectId de la organización asociada
    idOrganizacion: { type: mongoose.Schema.Types.ObjectId, ref: "Organizacion", required: true },
    nomProyecto: { type: String, required: true },
    descripcion: { type: String, required: true },
    saldo: [{
        monto:{
            type: Number,
            required: false
        },
        fecha: {
            type: Date,
            required: false
        }
    }],
    // Baja lógica: el proyecto no se borra de la base, se marca como inactivo.
    // Así se conserva el historial y los gastos/donaciones que lo referencian.
    activa: { type: Boolean, default: true },
    fechaBaja: { type: Date, default: null }
},
{ collection: 'proyectos', versionKey: false });


export default mongoose.model('Proyectos', proyectoSchema);
