import "dotenv/config";
import { pathToFileURL } from "node:url";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";

// ---------------------------------------------------------------------------
// CREDENCIALES DE DESARROLLO - NO USAR EN PRODUCCIÓN
// Lee las credenciales de process.env (.env) y, si la variable falta, usa los
// valores de fallback de abajo. Es idempotente:
//   - Si el usuario no existe, lo crea.
//   - Si ya existe (por email O por userName), NO se duplica nunca: sólo
//     sincroniza password y role cuando difieren de lo declarado en el entorno,
//     de modo que reiniciar con nodemon no arroje E11000 ni deje claves viejas.
// Uso directo:  node scripts/seedUsers.js   (o npm run seed)
// Uso desde el servidor: index.js la llama tras connectDB() con exitOnFinish=false
// ---------------------------------------------------------------------------
const FALLBACK_SEMBRILLA = [
    {
        userName: "admin",
        email: "admin@sumarimpacto.com",
        password: "Admin1234!",
        firstName: "Administrador",
        lastName: "SumarImpacto",
        role: "admin"
    },
    {
        userName: "operador",
        email: "usuario@sumarimpacto.com",
        password: "Usuario1234!",
        firstName: "Operador",
        lastName: "SumarImpacto",
        role: "usuario"
    }
];

// Prioriza el entorno (.env) y cae al valor de desarrollo declarado arriba
function usuariosDeEntorno() {
    return FALLBACK_SEMBRILLA.map((base, indice) => ({
        ...base,
        userName: (indice === 0 ? process.env.ADMIN_USER : process.env.OPERADOR_USER) || base.userName,
        email: (indice === 0 ? process.env.ADMIN_EMAIL : process.env.OPERADOR_EMAIL) || base.email,
        password: (indice === 0 ? process.env.ADMIN_PASSWORD : process.env.OPERADOR_PASSWORD) || base.password
    }));
}

export async function sembrarUsuarios({ exitOnFinish = false } = {}) {
    let creados = 0;
    let sincronizados = 0;
    let sinCambios = 0;

    for (const datos of usuariosDeEntorno()) {
        // Comprobación previa por email O userName (evita duplicados y E11000).
        // select("+password"): el schema tiene password select:false y hace
        // falta para comparar con comparePassword.
        const yaExiste = await User.findOne({
            $or: [{ email: datos.email }, { userName: datos.userName }]
        }).select("+password");

        if (yaExiste) {
            const cambiaPassword = !(await yaExiste.comparePassword(datos.password));
            const cambiaRol = yaExiste.role !== datos.role;

            if (!cambiaPassword && !cambiaRol) {
                sinCambios += 1;
                console.log(`- "${datos.email}" ya existe (role: ${yaExiste.role}). Sin cambios.`);
                continue;
            }

            // El hook pre("save") del modelo hashea el password sólo si cambió
            if (cambiaPassword) yaExiste.password = datos.password;
            if (cambiaRol) yaExiste.role = datos.role;
            await yaExiste.save();
            sincronizados += 1;
            console.log(`- "${datos.email}" sincronizado con el entorno (role: ${yaExiste.role}).`);
            continue;
        }

        try {
            await User.create(datos);
            creados += 1;
            console.log(`- "${datos.email}" creado con role "${datos.role}".`);
        } catch (error) {
            if (error.code === 11000) {
                console.log(`- "${datos.email}" ya existe por índice único (clave duplicada). No se modifica.`);
            } else {
                throw error;
            }
        }
    }

    console.log(`Listo. Creados: ${creados} | Sincronizados: ${sincronizados} | Sin cambios: ${sinCambios}`);
    console.log("Recordá: son credenciales de DESARROLLO, no usar en producción.");

    if (exitOnFinish) {
        process.exit(0);
    }
}

// Sólo se autoejecuta cuando se invoca por terminal (node scripts/seedUsers.js);
// al importarla desde index.js no dispara nada por su cuenta.
const esEjecucionDirecta =
    process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;

if (esEjecucionDirecta) {
    connectDB()
        .then(() => sembrarUsuarios({ exitOnFinish: true }))
        .catch((error) => {
            console.error("No se pudo completar el sembrado:", error);
            process.exit(1);
        });
}
