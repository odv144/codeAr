import mongoose from "mongoose";
const proyectoSchema = new mongoose.Schema({
    idProyecto: { type: Number, required: true },
    idOrganizacion: { type: Number, required: true },
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
     // Baja lógica: la organización no se borra de la base, se marca como inactiva.
    // Así se conserva el historial y los proyectos/donaciones que la referencian.
    activa: { type: Boolean, default: true },
    fechaBaja: { type: Date, default: null }
},  
{ collection: 'proyectos' });


export default mongoose.model('Proyectos', proyectoSchema);