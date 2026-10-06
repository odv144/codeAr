import { AppError } from "../utils/AppError.js";

/**
 * Middleware para rutas inexistentes. Va después de todas las rutas.
 */
export const notFound = (req, res, next) => {
  next(new AppError(404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`));
};

// Errores del driver de MongoDB cuando no hay conexión con la base (red caída, Atlas inaccesible, timeout)
const ERRORES_DE_CONEXION = [
  "MongoNetworkError",
  "MongoNetworkTimeoutError",
  "MongoServerSelectionError",
  "MongooseServerSelectionError"
];

const esErrorDeConexion = (err) =>
  ERRORES_DE_CONEXION.includes(err.name) ||
  (err.name === "MongooseError" && /buffering timed out/i.test(err.message));

// Nombres legibles por campo (opcional). Si el campo no está acá, se muestra tal cual.
const ETIQUETAS_CAMPO = { cuil: "CUIL" };

// Arma un mensaje genérico a partir de un error de clave duplicada (código 11000 de Mongo).
// No depende de ningún módulo en particular: usa el campo y el valor que informa el propio error.
const mensajeDuplicado = (err) => {
  const campo = Object.keys(err.keyPattern ?? {})[0];
  if (!campo) return "Ya existe un registro con ese valor";

  const etiqueta = ETIQUETAS_CAMPO[campo] ?? campo;
  const valor = err.keyValue?.[campo];
  return `Ya existe un registro con ese ${etiqueta}${valor !== undefined ? ` (${valor})` : ""}`;
};

/**
 * Middleware central de manejo de errores.
 * Traduce cualquier error a una respuesta con el código HTTP correcto:
 *   - AppError                -> el código que traiga (400, 404, 409...)
 *   - ValidationError (Mongoose) -> 400 con la lista de campos inválidos
 *   - CastError (Mongoose)       -> 400
 *   - Clave duplicada (11000)    -> 409
 *   - Sin conexión con MongoDB   -> 503
 *   - JSON mal formado           -> 400
 *   - Cualquier otro             -> 500 (el detalle solo se muestra en consola)
 * Los AppError conservan su propio mensaje.
 */
export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  let status = err.status ?? err.statusCode ?? 500;
  let mensaje = err.message;
  let errores = Array.isArray(err.errores) ? err.errores : [];

  if (err.name === "ValidationError" && err.errors) {
    status = 400;
    mensaje = "Datos inválidos";
    errores = Object.values(err.errors).map((e) => e.message);
  } else if (err.name === "CastError") {
    status = 400;
    mensaje = `Valor inválido para '${err.path}'`;
  } else if (err.code === 11000) {
    status = 409;
    mensaje = mensajeDuplicado(err);
  } else if (esErrorDeConexion(err)) {
    status = 503;
    mensaje = "La base de datos no está disponible. Intente nuevamente en unos instantes";
    console.error(`Sin conexión con MongoDB: ${err.message}`);
  } else if (err.type === "entity.parse.failed") {
    status = 400;
    mensaje = "El cuerpo de la petición no es un JSON válido";
  } else if (status >= 500 && !(err instanceof AppError)) {
    // Error inesperado: el detalle técnico queda en la consola y al cliente no se le expone
    console.error(err);
    mensaje = "Error interno del servidor";
  }

  if (req.originalUrl.startsWith("/vistas")) {
    const texto = [mensaje, ...errores].join(" - ");
    // Si la vista error.pug falla, se responde texto plano para no dejar el request colgado
    return res.status(status).render("error", { mensaje: texto }, (errorVista, html) => {
      if (errorVista) {
        console.error(errorVista);
        return res.type("text/plain").send(texto);
      }
      res.send(html);
    });
  }

  res.status(status).json({ mensaje, ...(errores.length > 0 && { errores }) });
};
