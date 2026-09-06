const express = require("express");
const app = express();
const PORT = 3000;

const proyectosRoutes = require("./routes/proyectosRoutes");
const organizacionesRoutes = require("./routes/organizacionesRoutes");

app.use(express.json());

// usar rutas
app.use("/proyectos", proyectosRoutes);
app.use("/organizaciones", organizacionesRoutes);

app.listen(PORT, () => {
    console.log("Servidor corriendo en puerto " + PORT);
});