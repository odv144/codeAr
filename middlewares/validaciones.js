import { AppError } from "../utils/AppError.js";
import { PATRONES, LONGITUD } from "../models/Organizaciones.js";

/**
 * VALIDACIONES UNIFICADAS
 * -----------------------
 * Un único archivo con todas las validaciones de entrada del proyecto, para no repetir código.
 *
 *   1) Reglas reutilizables por campo: texto(), numero(), entero(), fecha().
 *   2) Un esquema por entidad (Organización, Donación, Gasto, Proyecto, Donante): lista de campos
 *      con sus reglas, en el orden en que se informan los errores.
 *   3) Una función validarDatosX(body) por entidad -> { errores, datos }. Devuelve TODOS los
 *      errores juntos (no solo el primero) y los datos ya "limpios" (sin espacios sobrantes).
 *      Se puede usar directo, por ejemplo desde los formularios web.
 *   4) Un middleware validarX por entidad (POST y PUT). Si hay errores corta con 400 y la lista
 *      completa; si está todo bien deja los datos limpios en req.datosX para el controlador.
 *
 * Para validar un módulo nuevo alcanza con definir su esquema y llamar a crearMiddleware().
 */

/* ============================== REGLAS REUTILIZABLES ============================== */

const esVacio = (valor) => valor === undefined || valor === null;
const esTextoEnBlanco = (valor) => typeof valor === "string" && valor.trim() === "";

/**
 * Campo de texto obligatorio (el texto en blanco cuenta como faltante).
 *  - min / max: longitud permitida (después de quitar espacios)
 *  - patron: { regex, mensaje } formato que debe cumplir
 *  - minusculas: guarda el valor en minúsculas (útil para mails)
 *  - mensajeTipo: mensaje si no es texto (por defecto "debe ser texto")
 */
const texto = ({ min, max, patron, minusculas = false, mensajeTipo } = {}) => (campo, valor, errores, datos) => {
  if (esVacio(valor) || esTextoEnBlanco(valor)) {
    errores.push(`El campo '${campo}' es obligatorio`);
    return;
  }
  if (typeof valor !== "string") {
    errores.push(mensajeTipo ?? `El campo '${campo}' debe ser texto`);
    return;
  }

  let limpio = valor.trim();
  if (minusculas) limpio = limpio.toLowerCase();
  datos[campo] = limpio;

  if (min !== undefined && max !== undefined && (limpio.length < min || limpio.length > max)) {
    errores.push(`El campo '${campo}' debe tener entre ${min} y ${max} caracteres`);
  }
  if (patron && !patron.regex.test(limpio)) {
    errores.push(patron.mensaje);
  }
};

/**
 * Número (finito). Por defecto obligatorio y mayor a `minimo`.
 *  - inclusivo: acepta también el valor mínimo (>=)
 *  - opcional: si no viene el campo, se ignora
 */
const numero = ({ minimo = 0, inclusivo = false, opcional = false } = {}) => (campo, valor, errores, datos) => {
  if (esVacio(valor)) {
    if (!opcional) errores.push(`El campo '${campo}' es obligatorio`);
    return;
  }
  const invalido = typeof valor !== "number" || !Number.isFinite(valor) || (inclusivo ? valor < minimo : valor <= minimo);
  if (invalido) {
    errores.push(`El campo '${campo}' debe ser un número mayor ${inclusivo ? "o igual " : ""}a ${minimo}`);
    return;
  }
  datos[campo] = valor;
};

/** Número entero obligatorio mayor o igual a `minimo` (ids numéricos). */
const entero = ({ minimo = 1 } = {}) => (campo, valor, errores, datos) => {
  if (esVacio(valor)) {
    errores.push(`El campo '${campo}' es obligatorio`);
  } else if (!Number.isInteger(valor) || valor < minimo) {
    errores.push(`El campo '${campo}' debe ser un número entero mayor o igual a ${minimo}`);
  } else {
    datos[campo] = valor;
  }
};

/** Fecha obligatoria como texto parseable (ej. "2026-10-09"). */
const fecha = ({ ejemplo = "2026-10-09" } = {}) => (campo, valor, errores, datos) => {
  if (esVacio(valor) || valor === "") {
    errores.push(`El campo '${campo}' es obligatorio`);
  } else if (typeof valor !== "string" || Number.isNaN(Date.parse(valor))) {
    errores.push(`El campo '${campo}' debe ser una fecha válida (ej. ${ejemplo})`);
  } else {
    datos[campo] = valor;
  }
};

/**
 * _id de MongoDB (ObjectId): string de exactamente 24 caracteres hexadecimales.
 * Se usa para las claves foráneas (idProyecto, idDonante, idOrganizacion).
 */
const objectId = () => (campo, valor, errores, datos) => {
  if (esVacio(valor) || (typeof valor === "string" && valor.trim() === "")) {
    errores.push(`El campo '${campo}' es obligatorio`);
  } else if (typeof valor !== "string" || !/^[0-9a-fA-F]{24}$/.test(valor.trim())) {
    errores.push(`El campo '${campo}' debe ser un _id válido de MongoDB (24 caracteres hexadecimales)`);
  } else {
    datos[campo] = valor.trim();
  }
};

/**
 * Aplica un esquema { campo: regla } al body y devuelve:
 *  - errores: lista con todos los mensajes
 *  - datos: los datos ya limpios
 *  - erroresPorCampo: { campo: primer mensaje de ese campo } (para mostrarlo sobre el campo en los formularios)
 */
function validarCampos(body, esquema) {
  const origen = body ?? {};
  const errores = [];
  const datos = {};
  const erroresPorCampo = {};
  for (const [campo, regla] of Object.entries(esquema)) {
    const antes = errores.length;
    regla(campo, origen[campo], errores, datos);
    if (errores.length > antes) erroresPorCampo[campo] = errores[antes];
  }
  return { errores, datos, erroresPorCampo };
}

/* ================================== ESQUEMAS ================================== */

const ESQUEMA_ORGANIZACION = {
  nombre: texto(LONGITUD.nombre),
  tipo: texto(LONGITUD.tipo),
  cuil: texto({ patron: { regex: PATRONES.cuil, mensaje: "El CUIL debe tener el formato XX-XXXXXXXX-X (ej. 30-71234567-8)" } }),
  telefono: texto({ patron: { regex: PATRONES.telefono, mensaje: "El teléfono solo puede tener números, espacios, +, - y paréntesis (6 a 20 caracteres)" } }),
  mail: texto({ minusculas: true, patron: { regex: PATRONES.mail, mensaje: "El mail no tiene un formato válido" } }),
  direccion: texto(LONGITUD.direccion),
  responsable: texto(LONGITUD.responsable)
};

const MENSAJE_CBU = "El campo 'cbu' debe tener 22 dígitos numéricos";

const ESQUEMA_DONACION = {
  monto: numero(),
  cbu: texto({ patron: { regex: /^\d{22}$/, mensaje: MENSAJE_CBU }, mensajeTipo: MENSAJE_CBU }),
  fecha: fecha({ ejemplo: "2026-10-09" }),
  idProyecto: objectId(),
  idDonante: objectId(),
  idOrganizacion: objectId()
};

const ESQUEMA_GASTO = {
  idProyecto: objectId(),
  descripcion: texto({ min: 3, max: 200 }),
  monto: numero(),
  fecha: fecha({ ejemplo: "2026-10-08" })
};

// Listo para usar en el módulo Proyectos (crear / modificar con todos los datos).
const ESQUEMA_PROYECTO = {
  idOrganizacion: objectId(),
  nomProyecto: texto({ min: 2, max: 100 }),
  descripcion: texto({ min: 3, max: 500 }),
  saldo: numero({ minimo: 0, inclusivo: true, opcional: true })
};

// Listo para usar en el módulo Donantes (crear / modificar con todos los datos).
const ESQUEMA_DONANTE = {
  nombre: texto({ min: 2, max: 100 }),
  apellido: texto({ min: 2, max: 100 }),
  dni: texto({ patron: { regex: /^\d{7,8}$/, mensaje: "El campo 'dni' debe tener 7 u 8 dígitos numéricos" } }),
  telefono: texto({ patron: { regex: PATRONES.telefono, mensaje: "El teléfono solo puede tener números, espacios, +, - y paréntesis (6 a 20 caracteres)" } }),
  email: texto({ minusculas: true, patron: { regex: PATRONES.mail, mensaje: "El email no tiene un formato válido" } }),
  monto: numero(),
  fecha: fecha({ ejemplo: "2026-10-09" })
};

/* ====================== FUNCIONES DE VALIDACIÓN (sin Express) ====================== */

export const validarDatosOrganizacion = (body) => validarCampos(body, ESQUEMA_ORGANIZACION);
export const validarDatosDonacion = (body) => validarCampos(body, ESQUEMA_DONACION);
export const validarDatosGasto = (body) => validarCampos(body, ESQUEMA_GASTO);
export const validarDatosProyecto = (body) => validarCampos(body, ESQUEMA_PROYECTO);
export const validarDatosDonante = (body) => validarCampos(body, ESQUEMA_DONANTE);

/* ================================== MIDDLEWARES ================================== */

/**
 * Crea un middleware de validación a partir de un esquema.
 *  - propiedad: dónde se dejan los datos limpios (req[propiedad])
 *  - mensaje: mensaje general del 400 (la lista de errores viaja aparte)
 */
export const crearMiddleware = (esquema, { propiedad, mensaje }) => (req, res, next) => {
  try {
    const { errores, datos } = validarCampos(req.body, esquema);

    if (errores.length > 0) {
      throw new AppError(400, mensaje, errores);
    }

    req[propiedad] = datos;
    next();
  } catch (error) {
    next(error);
  }
};

export const validarOrganizacion = crearMiddleware(ESQUEMA_ORGANIZACION, { propiedad: "datosOrganizacion", mensaje: "Datos de la organización inválidos" });
export const validarDonacion = crearMiddleware(ESQUEMA_DONACION, { propiedad: "datosDonacion", mensaje: "Datos de la donación inválidos" });
export const validarGasto = crearMiddleware(ESQUEMA_GASTO, { propiedad: "datosGasto", mensaje: "Datos del gasto inválidos" });
export const validarProyecto = crearMiddleware(ESQUEMA_PROYECTO, { propiedad: "datosProyecto", mensaje: "Datos del proyecto inválidos" });
export const validarDonante = crearMiddleware(ESQUEMA_DONANTE, { propiedad: "datosDonante", mensaje: "Datos del donante inválidos" });
