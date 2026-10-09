import "dotenv/config";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";

// ---------------------------------------------------------------------------
// CREDENCIALES DE DESARROLLO - NO USAR EN PRODUCCIÓN
// Este script sólo crea usuarios de prueba para el entorno local.
// Es idempotente: si el usuario ya existe NO se modifica (no cambia password,
// ni rol, ni ningún otro dato).
// Uso:  node scripts/seedUsers.js
// ---------------------------------------------------------------------------
const USUARIOS_DE_SEMBRILLA = [
    {
        userName: "admin",
        email: "admin@sumarimpacto.com",
        password: "Admin1234",
        firstName: "Administrador",
        lastName: "SumarImpacto",
        role: "admin"
    },
    {
        userName: "operador",
        email: "usuario@sumarimpacto.com",
        password: "Usuario1234",
        firstName: "Operador",
        lastName: "SumarImpacto",
        role: "usuario"
    }
];

async function sembrarUsuarios() {
    await connectDB();

    let creados = 0;
    let existentes = 0;

    for (const datos of USUARIOS_DE_SEMBRILLA) {
        const yaExiste = await User.findOne({ email: datos.email });

        if (yaExiste) {
            existentes += 1;
            console.log(
                `- "${datos.email}" ya existe (role: ${yaExiste.role}). No se modifica.`
            );
            continue;
        }

        try {
            await User.create(datos);
            creados += 1;
            console.log(`- "${datos.email}" creado con role "${datos.role}".`);
        } catch (error) {
            if (error.code === 11000) {
                console.log(
                    `- "${datos.email}" ya existe por índice único (clave duplicada). No se modifica.`
                );
            } else {
                throw error;
            }
        }
    }

    console.log(`Listo. Creados: ${creados} | Ya existían: ${existentes}`);
    console.log("Recordá: son credenciales de DESARROLLO, no usar en producción.");

    process.exit(0);
}

sembrarUsuarios().catch((error) => {
    console.error("No se pudo completar el sembrado:", error);
    process.exit(1);
});
