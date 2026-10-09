export function validarDatosGasto(body = {}) {
  const errores = [];
  const datos = {};

  const { idProyecto, descripcion, monto, fecha } = body;

  // idProyecto
  if (idProyecto === undefined || idProyecto === null) {
    errores.push("El campo 'idProyecto' es obligatorio");
  } else if (!Number.isInteger(idProyecto) || idProyecto < 1) {
    errores.push("El campo 'idProyecto' debe ser un número entero mayor o igual a 1");
  } else {
    datos.idProyecto = idProyecto;
  }

  // descripcion
  if (descripcion === undefined || descripcion === null || (typeof descripcion === "string" && descripcion.trim() === "")) {
    errores.push("El campo 'descripcion' es obligatorio");
  } else if (typeof descripcion !== "string") {
    errores.push("El campo 'descripcion' debe ser texto");
  } else if (descripcion.trim().length < 3 || descripcion.trim().length > 200) {
    errores.push("El campo 'descripcion' debe tener entre 3 y 200 caracteres");
  } else {
    datos.descripcion = descripcion.trim();
  }

  // monto
  if (monto === undefined || monto === null) {
    errores.push("El campo 'monto' es obligatorio");
  } else if (typeof monto !== "number" || !Number.isFinite(monto) || monto <= 0) {
    errores.push("El campo 'monto' debe ser un número mayor a 0");
  } else {
    datos.monto = monto;
  }

  // fecha
  if (fecha === undefined || fecha === null || fecha === "") {
    errores.push("El campo 'fecha' es obligatorio");
  } else if (typeof fecha !== "string" || Number.isNaN(Date.parse(fecha))) {
    errores.push("El campo 'fecha' debe ser una fecha válida (ej. 2026-10-08)");
  } else {
    datos.fecha = fecha;
  }

  return { errores, datos };
}