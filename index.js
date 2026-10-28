import "dotenv/config"; // tiene que ser el PRIMER import: carga el .env antes de evaluar el resto de los módulos
import express from "express";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3200;

// Trust proxy para entorno Vercel (cookies seguras tras proxy)
app.set("trust proxy", 1);

// ---------------------------------------------------------------------------
// Secreto JWT
//   - Producción sin JWT_SECRET: la aplicación NO arranca (process.exit).
//   - Desarrollo: fallback efímero, con advertencia explícita.
// ---------------------------------------------------------------------------
const JWT_SECRET = process.env.JWT_SECRET;

if (process.env.NODE_ENV === "production" && !JWT_SECRET) {
    console.error(
        "Falta JWT_SECRET en el entorno de producción. No se puede iniciar el servidor."
    );
    process.exit(1);
}

if (!JWT_SECRET) {
    console.warn(
        "[jwt] JWT_SECRET no definido: se usa un secreto de DESARROLLO efímero."
    );
    process.env.JWT_SECRET = crypto.randomBytes(32).toString("hex");
}

import proyectosRoutes from "./routes/proyectosRoutes.js";
import organizacionesRoutes from "./routes/organizacionesRoutes.js";
import gastosRoutes from "./routes/gastosRoutes.js";
import donacionesRoutes from "./routes/donacionesRoutes.js";
import donantesRoutes from "./routes/donantesRoutes.js";
import vistasRoutes from "./routes/vistasRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { isAuthenticated, checkAuth } from "./middlewares/auth.js";
import { connectDB } from "./config/db.js";
import { sembrarUsuarios } from "./scripts/seedUsers.js";
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

// Middleware global de autenticación JWT (inyecta req.user y res.locals.currentUser)
app.use(checkAuth);

// Expone la ruta actual a todas las vistas Pug.
app.use((req, res, next) => {
    res.locals.rutaActual = req.path;
    next();
});

// Autenticación: /login, /registro y /logout son accesibles sin autenticación.
app.use("/", authRoutes);

// Usar rutas API JSON -> sin autenticación responden 401 (JSON)
app.use("/proyectos", isAuthenticated, proyectosRoutes);
app.use("/organizaciones", isAuthenticated, organizacionesRoutes);
app.use("/gastos", isAuthenticated, gastosRoutes);
app.use("/donaciones", isAuthenticated, donacionesRoutes);
app.use("/donantes", isAuthenticated, donantesRoutes);

// Usar rutas de vistas Pug -> sin autenticación redirigen a /login
app.use("/vistas", isAuthenticated, vistasRoutes);

// Ruta principal
app.get("/", isAuthenticated, (req, res) => {
    res.render("index", { titulo: "Panel Principal | SumarImpacto" });
});

// Middlewares finales: ruta inexistente (404) y manejo central de errores.
app.use(notFound);
app.use(errorHandler);

await connectDB();

await sembrarUsuarios({ exitOnFinish: false });

const server = app.listen(PORT, () => {
    console.log("Servidor corriendo en puerto " + PORT);
});

server.on("error", (error) => {
    console.error(`No se pudo iniciar el servidor: ${error.message}`);
    process.exit(1);
});
