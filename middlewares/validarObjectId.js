import { AppError } from "../utils/AppError.js";

/**
 * Middleware que valida el parámetro :_id de la ruta (el _id / ObjectId de MongoDB):
 * exactamente 24 caracteres hexadecimales. 
 */
export const validarObjectId = (req, res, next) => {
  try {
    if (!/^[0-9a-fA-F]{24}$/.test(req.params._id)) {
      throw new AppError(400, "El _id debe ser un _id válido de MongoDB (24 caracteres hexadecimales)");
    }
    next();
  } catch (error) {
    next(error);
  }
};
