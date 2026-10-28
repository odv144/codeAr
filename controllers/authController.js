import jwt from "jsonwebtoken";
import User from "../models/User.js";
import {
    JWT_COOKIE_NAME,
    JWT_COOKIE_OPTIONS
} from "../middlewares/auth.js";

const CREDENCIALES_INVALIDAS = { error: "Credenciales inválidas" };

const generarTokenYAsignarCookie = (user, res) => {
    const secret = process.env.JWT_SECRET || "fallback_jwt_secret_dev";
    const expiresIn = process.env.JWT_EXPIRES_IN || "8h";

    const payload = {
        id: user._id,
        userName: user.userName,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
    };

    const token = jwt.sign(payload, secret, { expiresIn });
    const maxAge = 8 * 60 * 60 * 1000; // 8 horas

    res.cookie(JWT_COOKIE_NAME, token, {
        ...JWT_COOKIE_OPTIONS,
        maxAge
    });

    return token;
};

// GET /login -> vista de ingreso. Con token activo manda directo al panel.
const mostrarLogin = (req, res) => {
    if (req.user) {
        return res.redirect("/vistas");
    }
    const registrado = req.query.registrado === "true";
    return res.render("login", {
        titulo: "Ingresar | SumarImpacto",
        successMessage: registrado ? "¡Usuario creado exitosamente! Por favor, inicia sesión con tus credenciales." : null
    });
};

// GET /vistas/registro -> vista de registro. Con token activo manda directo al panel.
const mostrarRegistro = (req, res) => {
    if (req.user) {
        return res.redirect("/vistas");
    }
    return res.render("registro", { titulo: "Registro | SumarImpacto" });
};

// POST /vistas/registro -> procesa el registro de nuevo usuario.
const registrar = async (req, res) => {
    try {
        const { userName, email, password, firstName, lastName } = req.body || {};

        if (!userName || !email || !password || !firstName || !lastName) {
            return res.status(400).json({ error: "Todos los campos son obligatorios" });
        }

        const emailLower = String(email).toLowerCase().trim();
        const userNameClean = String(userName).trim();

        const existente = await User.findOne({
            $or: [{ email: emailLower }, { userName: userNameClean }]
        });

        if (existente) {
            return res.status(400).json({ error: "El nombre de usuario o correo ya se encuentra registrado" });
        }

        const newUser = await User.create({
            userName: userNameClean,
            email: emailLower,
            password,
            firstName: String(firstName).trim(),
            lastName: String(lastName).trim(),
            role: "operador"
        });

        return res.status(201).json({
            message: "Usuario registrado con éxito",
            redirectUrl: "/login?registrado=true"
        });
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        return res.status(500).json({ error: "Error interno del servidor al registrar" });
    }
};

// POST /login -> credenciales en JSON.
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

        generarTokenYAsignarCookie(user, res);

        return res.status(200).json({
            message: "Login exitoso",
            redirectUrl: "/vistas"
        });
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
};

// GET /logout -> limpia la cookie y manda al login.
const logout = async (req, res) => {
    res.clearCookie(JWT_COOKIE_NAME, JWT_COOKIE_OPTIONS);
    return res.redirect("/login");
};

export { mostrarLogin, mostrarRegistro, registrar, login, logout };
