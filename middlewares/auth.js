import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError.js";

export const JWT_COOKIE_NAME = "sumarimpacto.token";
export const JWT_COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
};

const esNavegacionWeb = (req) => req.baseUrl === "" || req.baseUrl === "/vistas";

/**
 * Middleware global para extraer y verificar el JWT desde la cookie,
 * inyectando req.user y res.locals.currentUser.
 */
export const checkAuth = (req, res, next) => {
    req.user = null;
    res.locals.currentUser = null;

    const token = req.cookies?.[JWT_COOKIE_NAME];
    if (!token) {
        return next();
    }

    try {
        const secret = process.env.JWT_SECRET;
        if (process.env.NODE_ENV === "production" && !secret) {
            throw new Error("JWT_SECRET no definido en producción");
        }
        const jwtSecret = secret || "fallback_jwt_secret_dev";
        const decoded = jwt.verify(token, jwtSecret);
        req.user = decoded;
        res.locals.currentUser = decoded;
    } catch (error) {
        res.clearCookie(JWT_COOKIE_NAME, JWT_COOKIE_OPTIONS);
    }

    next();
};

/**
 * Exige una autenticación válida (JWT presente y correcto).
 */
export const isAuthenticated = (req, res, next) => {
    if (req.user) {
        return next();
    }

    if (esNavegacionWeb(req)) {
        return res.redirect("/login");
    }

    return next(new AppError(401, "No autenticado"));
};

/**
 * Exige rol de administrador.
 */
export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        return next();
    }

    return next(new AppError(403, "Acceso denegado: requiere permisos de Administrador"));
};
