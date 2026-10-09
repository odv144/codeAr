import { validarDatosGasto } from "../utils/validacionesGasto.js";
import { AppError } from "../utils/AppError.js";

/**
 * Middleware de validación de los datos del gasto (POST y PUT).
 * Si hay errores corta con 400 y la lista completa; si está todo bien deja los datos
 * limpios en req.datosGasto para que el controlador los use.
 */
export const validarGasto = (req, res, next) => {
  try {
    const { errores, datos } = validarDatosGasto(req.body);

    if (errores.length > 0) {
      throw new AppError(400, "Datos del gasto inválidos", errores);
    }

    req.datosGasto = datos;
    next();
  } catch (error) {
    next(error);
  }
};