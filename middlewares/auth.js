import { AppError } from "../utils/AppError.js";

// Nombre y opciones de la cookie de sesión. Se comparten entre el montaje de
// express-session (index.js) y el logout (controllers/authController.js) para
// que clearCookie use exactamente las mismas opciones con las que se creó.
// IMPORTANTE: no incluir maxAge acá (clearCookie debe expirar la cookie).
export const SESSION_COOKIE_NAME = "sumarimpacto.sid";
export const SESSION_COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
};

// isMountedOn: se decide por req.baseUrl, que Express completa según el lugar
// donde se montó el router ("" para app.get("/..."), "/vistas", "/proyectos", ...).
// Así un mismo middleware atiende a la navegación web y a la API JSON.
const esNavegacionWeb = (req) => req.baseUrl === "" || req.baseUrl === "/vistas";

/**
 * Exige una sesión activa.
 *  - Navegación web (/ y /vistas) -> redirect a /login
 *  - API JSON                      -> 401 (vía errorHandler: { mensaje, errores })
 */
export const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }

    if (esNavegacionWeb(req)) {
        return res.redirect("/login");
    }

    return next(new AppError(401, "No autenticado"));
};

/**
 * Exige el rol 'admin'. Devuelve siempre 403: el errorHandler existente decide
 * el formato (render de error.pug para /vistas, JSON para la API).
 * El ocultamiento de botones en Pug es sólo cosmético: la autorización es ésta.
 */
export const isAdmin = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === "admin") {
        return next();
    }

    return next(new AppError(403, "Acceso denegado: requiere permisos de Administrador"));
};
