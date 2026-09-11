const express = require("express");
const app = express();
const PORT = 3000;

const proyectosRoutes = require("./routes/proyectosRoutes");
const organizacionesRoutes = require("./routes/organizacionesRoutes");
const gastosRoutes = require("./routes/gastosRoutes");
const donacionesRoutes = require("./routes/donacionesRoutes");
const donantesRoutes = require("./routes/donantesRoutes");

app.use(express.json());

// usar rutas
app.use("/proyectos", proyectosRoutes);
app.use("/organizaciones", organizacionesRoutes);
app.use("/gastos", gastosRoutes);
app.use("/donaciones", donacionesRoutes);
app.use("/donantes", donantesRoutes);


app.listen(PORT, () => {
    console.log("Servidor corriendo en puerto " + PORT);
});