import "dotenv/config"; // tiene que ser el PRIMER import: carga el .env antes de evaluar el resto de los módulos
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3200;

import proyectosRoutes from "./routes/proyectosRoutes.js";
import organizacionesRoutes from "./routes/organizacionesRoutes.js";
import gastosRoutes from "./routes/gastosRoutes.js";
import donacionesRoutes from "./routes/donacionesRoutes.js";
import donantesRoutes from "./routes/donantesRoutes.js";
import vistasRoutes from "./routes/vistasRoutes.js";
import { connectDB } from "./config/db.js";
import { requestLogger } from "./middlewares/requestLogger.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";

// Configuración del motor de plantillas Pug
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(requestLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Usar rutas API JSON
app.use("/proyectos", proyectosRoutes);
app.use("/organizaciones", organizacionesRoutes);
app.use("/gastos", gastosRoutes);
app.use("/donaciones", donacionesRoutes);
app.use("/donantes", donantesRoutes);

// Usar rutas de vistas Pug
app.use("/vistas", vistasRoutes);

// Ruta principal
app.get("/", (req, res) => {
    res.render("index", { titulo: "SumarImpacto - Panel Principal" });
});

// Middlewares finales: ruta inexistente (404) y manejo central de errores.
// Tienen que ir DESPUÉS de todas las rutas.
app.use(notFound);
app.use(errorHandler);

// Arranque: primero se conecta a MongoDB Atlas y recién después se acepta tráfico.
// connectDB ya informa el error y corta el proceso (process.exit(1)) si no puede conectar,
// por eso acá no hace falta un try/catch.
await connectDB();

const server = app.listen(PORT, () => {
    console.log("Servidor corriendo en puerto " + PORT);
});

// Errores del servidor HTTP (ej. puerto ocupado) no pasan por try/catch: llegan por este evento
server.on("error", (error) => {
    console.error(`No se pudo iniciar el servidor: ${error.message}`);
    process.exit(1);
});

