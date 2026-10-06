/**
 * Middleware que registra en consola cada request: método, URL, estado y duración.
 * Ej: POST /organizaciones 201 - 42ms
 */
export const requestLogger = (req, res, next) => {
  const inicio = Date.now();

  res.on("finish", () => {
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${Date.now() - inicio}ms`);
  });

  next();
};
