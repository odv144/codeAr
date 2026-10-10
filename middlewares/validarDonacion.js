import { validarDatosDonacion } from "../utils/validacionesDonacion.js";
import { AppError } from "../utils/AppError.js";

export const validarDonacion = (req, res, next) => {
    try {
        const { errores, datos } = validarDatosDonacion(req.body);

        if (errores.length > 0) {
            throw new AppError(400, "Datos de la donación inválidos", errores);
        }

        req.datosDonacion = datos;
        next();
    } catch (error) {
        next(error);
    }
};