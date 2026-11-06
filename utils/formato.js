// Formato de importes para las vistas Pug (vía app.locals).
export const moneda = (monto) =>
  `$ ${Number(monto ?? 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const monedaMovimiento = ({ monto, tipo }) =>
  `${tipo === "gasto" ? "-" : "+"} ${moneda(monto)}`;
