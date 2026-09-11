const express = require("express");
const app = express();
const PORT = 3000;

const proyectosRoutes = require("./routes/proyectosRoutes");
const organizacionesRoutes = require("./routes/organizacionesRoutes");
<<<<<<< HEAD
const gastosRoutes = require("./routes/gastosRoutes");
=======
const donacionesRoutes = require("./routes/donacionesRoutes");
>>>>>>> b7194ac9d92b80a49902917a3d1944515a3d3c0b

app.use(express.json());

// usar rutas
app.use("/proyectos", proyectosRoutes);
app.use("/organizaciones", organizacionesRoutes);
<<<<<<< HEAD
app.use("/gastos", gastosRoutes);
=======
app.use("/donaciones", donacionesRoutes);
>>>>>>> b7194ac9d92b80a49902917a3d1944515a3d3c0b

app.listen(PORT, () => {
    console.log("Servidor corriendo en puerto " + PORT);
});