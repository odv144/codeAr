import { AppError } from "../utils/AppError.js";

/**
 * Middleware que valida el parámetro :id de la ruta (entero positivo).
 */
export const validarId = (req, res, next) => {
  try {
    if (!/^[1-9]\d*$/.test(req.params.id)) {
      throw new AppError(400, "El id debe ser un número entero positivo");
    }
    next();
  } catch (error) {
    next(error);
  }
};
