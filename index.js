const express = require("express");
const path = require("path");
const app = express();
const PORT = 3000;

const proyectosRoutes = require("./routes/proyectosRoutes");
const organizacionesRoutes = require("./routes/organizacionesRoutes");
const gastosRoutes = require("./routes/gastosRoutes");
const donacionesRoutes = require("./routes/donacionesRoutes");
const donantesRoutes = require("./routes/donantesRoutes");
const vistasRoutes = require("./routes/vistasRoutes");

// Configuración del motor de plantillas Pug
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

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

app.listen(PORT, () => {
    console.log("Servidor corriendo en puerto " + PORT);
});
