import { AppError } from "../utils/AppError.js";

/**
 * Middleware que verifica que POST y PUT lleguen con un body JSON (un objeto con contenido).
 * Evita errores confusos cuando el cliente se olvida del body o del header
 * Content-Type: application/json (en ese caso Express deja req.body vacío).
 */
export const validarBody = (req, res, next) => {
  try {
    const body = req.body;
    const esObjeto = body !== null && typeof body === "object" && !Array.isArray(body);

    if (!esObjeto || Object.keys(body).length === 0) {
      throw new AppError(
        400,
        "El cuerpo de la petición está vacío o no es un objeto JSON. Verifique que envía JSON con el header Content-Type: application/json"
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
