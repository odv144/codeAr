import { PATRONES, LONGITUD } from "../models/Organizaciones.js";

const CAMPOS = ["nombre", "tipo", "cuil", "telefono", "mail", "direccion", "responsable"];

/**
 * Validaciones simples de los datos de una organización.
 * Devuelve TODOS los errores juntos (no solo el primero) y los datos ya "limpios"
 * (sin espacios sobrantes y con el mail en minúsculas).
 *
 * Se usa tanto en la API (middleware validarOrganizacion) como en el formulario web.
 */
export function validarDatosOrganizacion(body = {}) {
  const errores = [];
  const datos = {};

  // 1) Obligatorios y tipo texto
  for (const campo of CAMPOS) {
    const valor = body?.[campo];

    if (valor === undefined || valor === null || (typeof valor === "string" && valor.trim() === "")) {
      errores.push(`El campo '${campo}' es obligatorio`);
    } else if (typeof valor !== "string") {
      errores.push(`El campo '${campo}' debe ser texto`);
    } else {
      datos[campo] = valor.trim();
    }
  }

  // 2) Longitudes
  for (const [campo, { min, max }] of Object.entries(LONGITUD)) {
    const valor = datos[campo];
    if (valor !== undefined && (valor.length < min || valor.length > max)) {
      errores.push(`El campo '${campo}' debe tener entre ${min} y ${max} caracteres`);
    }
  }

  // 3) Formatos
  if (datos.cuil !== undefined && !PATRONES.cuil.test(datos.cuil)) {
    errores.push("El CUIL debe tener el formato XX-XXXXXXXX-X (ej. 30-71234567-8)");
  }
  if (datos.telefono !== undefined && !PATRONES.telefono.test(datos.telefono)) {
    errores.push("El teléfono solo puede tener números, espacios, +, - y paréntesis (6 a 20 caracteres)");
  }
  if (datos.mail !== undefined) {
    datos.mail = datos.mail.toLowerCase();
    if (!PATRONES.mail.test(datos.mail)) {
      errores.push("El mail no tiene un formato válido");
    }
  }

  return { errores, datos };
}
