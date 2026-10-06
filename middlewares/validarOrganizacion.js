import { validarDatosOrganizacion } from "../utils/validacionesOrganizacion.js";
import { AppError } from "../utils/AppError.js";

/**
 * Middleware de validación de los datos de la organización (POST y PUT).
 * Si hay errores corta con 400 y la lista completa; si está todo bien deja los datos
 * limpios en req.datosOrganizacion para que el controlador los use.
 */
export const validarOrganizacion = (req, res, next) => {
  try {
    const { errores, datos } = validarDatosOrganizacion(req.body);

    if (errores.length > 0) {
      throw new AppError(400, "Datos de la organización inválidos", errores);
    }

    req.datosOrganizacion = datos;
    next();
  } catch (error) {
    next(error);
  }
};
