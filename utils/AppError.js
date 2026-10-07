/**
 * Error "esperado" de la aplicación (validación, no encontrado, conflicto, etc.).
 * Lleva el código HTTP que corresponde y, opcionalmente, una lista de detalles.
 * El middleware errorHandler lo convierte en la respuesta final.
 */
export class AppError extends Error {
  constructor(status, mensaje, errores = []) {
    super(mensaje);
    this.name = "AppError";
    this.status = status;
    this.errores = errores;
  }
}
