const express = require("express");
const app = express();
const PORT = 3000;

const proyectosRoutes = require("./routes/proyectosRoutes");

app.use(express.json());

// usar rutas
app.use("/proyectos", proyectosRoutes);

app.listen(PORT, () => {
    console.log("Servidor corriendo en puerto " + PORT);
});