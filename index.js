import "dotenv/config"; // tiene que ser el PRIMER import: carga el .env antes de evaluar el resto de los módulos
import express from "express";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import session from "express-session";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3200;

// ---------------------------------------------------------------------------
// Secreto de sesión
//   - Producción sin SESSION_SECRET: la aplicación NO arranca (process.exit).
//   - Desarrollo: fallback efímero, con advertencia explícita.
// ---------------------------------------------------------------------------
const SESSION_SECRET = process.env.SESSION_SECRET;

if (process.env.NODE_ENV === "production" && !SESSION_SECRET) {
    console.error(
        "Falta SESSION_SECRET en el entorno de producción. No se puede iniciar el servidor."
    );
    process.exit(1);
}

let sessionSecret = SESSION_SECRET;
if (!sessionSecret) {
    console.warn(
        "[sesiones] SESSION_SECRET no definido: se usa un secreto de DESARROLLO efímero. Las sesiones se pierden al reiniciar el proceso."
    );
    sessionSecret = crypto.randomBytes(32).toString("hex");
}

// Duración de la cookie de sesión (por defecto 8 horas)
const SESSION_TTL_MINUTES = Number(process.env.SESSION_TTL_MINUTES) || 480;

import proyectosRoutes from "./routes/proyectosRoutes.js";
import organizacionesRoutes from "./routes/organizacionesRoutes.js";
import gastosRoutes from "./routes/gastosRoutes.js";
import donacionesRoutes from "./routes/donacionesRoutes.js";
import donantesRoutes from "./routes/donantesRoutes.js";
import vistasRoutes from "./routes/vistasRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { isAuthenticated, SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from "./middlewares/auth.js";
import { connectDB } from "./config/db.js";
import { requestLogger } from "./middlewares/requestLogger.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";

// Configuración del motor de plantillas Pug
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(requestLogger);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// Sesiones del servidor.
// ATENCIÓN: el almacén por defecto (MemoryStore) es EXCLUSIVO para desarrollo y
// pruebas: pierde todas las sesiones al reiniciar y no sirve para producción.
app.use(
    session({
        name: SESSION_COOKIE_NAME,
        secret: sessionSecret,
        resave: false,
        saveUninitialized: false,
        cookie: {
            ...SESSION_COOKIE_OPTIONS,
            maxAge: SESSION_TTL_MINUTES * 60 * 1000
        }
    })
);

// Expone el usuario de la sesión y la ruta actual a todas las vistas Pug.
app.use((req, res, next) => {
    res.locals.currentUser = req.session.user || null;
    res.locals.rutaActual = req.path;
    next();
});

// Autenticación: /login y /logout son accesibles sin sesión.
app.use("/", authRoutes);

// Usar rutas API JSON -> sin sesión responden 401 (JSON)
app.use("/proyectos", isAuthenticated, proyectosRoutes);
app.use("/organizaciones", isAuthenticated, organizacionesRoutes);
app.use("/gastos", isAuthenticated, gastosRoutes);
app.use("/donaciones", isAuthenticated, donacionesRoutes);
app.use("/donantes", isAuthenticated, donantesRoutes);

// Usar rutas de vistas Pug -> sin sesión redirigen a /login
app.use("/vistas", isAuthenticated, vistasRoutes);

// Ruta principal
app.get("/", isAuthenticated, (req, res) => {
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

