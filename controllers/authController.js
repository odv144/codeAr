import User from "../models/User.js";
import {
    SESSION_COOKIE_NAME,
    SESSION_COOKIE_OPTIONS
} from "../middlewares/auth.js";

// Mensaje único: no revela si falló el usuario/email o la contraseña.
const CREDENCIALES_INVALIDAS = { error: "Credenciales inválidas" };

const regenerarSesion = (req) =>
    new Promise((resolve, reject) => {
        req.session.regenerate((error) => (error ? reject(error) : resolve()));
    });

const guardarSesion = (req) =>
    new Promise((resolve, reject) => {
        req.session.save((error) => (error ? reject(error) : resolve()));
    });

const destruirSesion = (req) =>
    new Promise((resolve, reject) => {
        req.session.destroy((error) => (error ? reject(error) : resolve()));
    });

// GET /login -> vista de ingreso. Con sesión activa manda directo al panel.
const mostrarLogin = (req, res) => {
    if (req.session && req.session.user) {
        return res.redirect("/vistas");
    }
    return res.render("login", { titulo: "Ingresar | SumarImpacto" });
};

// POST /login -> credenciales en JSON.
//   401 { error: "Credenciales inválidas" } -> incompletas, sin usuario o password errónea
//   200 { message, redirectUrl }            -> sesión regenerada y usuario guardado
const login = async (req, res) => {
    try {
        const cuerpo = req.body || {};
        const identificador = String(cuerpo.email ?? cuerpo.userName ?? "").trim();
        const clave = String(cuerpo.password ?? "");

        if (!identificador || !clave) {
            return res.status(401).json(CREDENCIALES_INVALIDAS);
        }

        const user = await User.findOne({
            $or: [
                { email: identificador.toLowerCase() },
                { userName: identificador }
            ]
        }).select("+password");

        if (!user) {
            return res.status(401).json(CREDENCIALES_INVALIDAS);
        }

        const passwordOk = await user.comparePassword(clave);
        if (!passwordOk) {
            return res.status(401).json(CREDENCIALES_INVALIDAS);
        }

        // Regenera el id de sesión recién verificadas las credenciales
        // (protege contra la fijación de sesión) y sólo después se guarda el usuario.
        await regenerarSesion(req);

        // Sólo los datos necesarios. Nunca la contraseña.
        req.session.user = {
            id: user._id,
            userName: user.userName,
            email: user.email,
            firstName: user.firstName,
            role: user.role
        };

        await guardarSesion(req);

        return res.status(200).json({
            message: "Login exitoso",
            redirectUrl: "/vistas"
        });
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
};

// GET /logout -> destruye la sesión, limpia la cookie y manda al login.
const logout = async (req, res) => {
    try {
        if (req.session) {
            await destruirSesion(req);
        }
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
    }

    res.clearCookie(SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS);
    return res.redirect("/login");
};

export { mostrarLogin, login, logout };
