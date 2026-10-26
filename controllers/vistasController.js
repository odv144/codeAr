import {
    obtenerDonantes,
    obtenerDonantesId,
    insertarDonante,
    actualizarDonante,
    eliminarDonante
} from "../services/serviceDonante.js";

// Servicios con MongoDB
import {
    obtenerProyectosId,
    insertarProyecto,
    obtenerProyectos,
    actualizarProyecto,
    eliminarProyecto
} from "../services/serviceProyecto.js";
import {
    obtenerOrganizaciones,
    crearOrganizacion,
    obtenerOrganizacionPorId,
    actualizarOrganizacion,
    darDeBajaOrganizacion,
    reactivarOrganizacion
} from "../services/serviceOrganizacion.js";
import { validarDatosOrganizacion } from "../middlewares/validaciones.js";
import { AppError } from "../utils/AppError.js";
import {
    obtenerGastos,
    obtenerGastoPorId,
    crearGasto,
    actualizarGasto,
    eliminarGasto
} from "../services/serviceGastos.js";
import {
    obtenerDonaciones,
    obtenerDonacionPorId,
    crearDonacion,
    actualizarDonacion,
    eliminarDonacion
} from "../services/serviceDonaciones.js";


/* ===================== HOME ===================== */

const renderHome = (req, res) => {
    res.render("index", { titulo: "Panel Principal | SumarImpacto" });
};


/* ===================== PROYECTOS (MongoDB) ===================== */

const renderProyectos = async (req, res) => {
    try {
        const [proyectos, organizaciones] = await Promise.all([
            obtenerProyectos(),
            obtenerOrganizaciones({ incluirBajas: true })
        ]);
        const nombresOrg = new Map(organizaciones.map((o) => [o.idOrganizacion, o.nombre]));
        const filas = proyectos.map((p) => ({
            ...p,
            nombreOrganizacion: nombresOrg.get(p.idOrganizacion) ?? null
        }));
        res.render("proyectos", { proyectos: filas });
    } catch (error) {
        res.status(500).send("Error al cargar proyectos");
    }
};

// Organizaciones activas para los <select> de los formularios de proyectos.
// En edición, si la organización actual del proyecto está dada de baja se agrega
// igual a la lista para conservar la precarga sin romper el guardado.
const organizacionesParaFormulario = async (idActual) => {
    const activas = await obtenerOrganizaciones();
    if (idActual === undefined || idActual === null) return activas;
    const idNum = Number(idActual);
    if (activas.some((o) => o.idOrganizacion === idNum)) return activas;
    const todas = await obtenerOrganizaciones({ incluirBajas: true });
    const actual = todas.find((o) => o._id === idNum);
    return actual
        ? [...activas, actual].sort((a, b) => a._id - b._id)
        : activas;
};

const renderCrearProyecto = async (req, res, next) => {
    try {
        const organizaciones = await organizacionesParaFormulario();
        res.render("proyectosCrear", { organizaciones });
    } catch (error) {
        next(error);
    }
};

const guardarProyectoDesdeVista = async (req, res) => {
    try {
        const {idOrganizacion, nomProyecto, descripcion, saldo } = req.body;
       // const idOrganizacion = Number(req.body.idOrganizacion);

        // insertarProyecto calcula el idProyecto y arma el saldo inicial por su cuenta
        console.log(req.body)
        await insertarProyecto({ idOrganizacion, nomProyecto, descripcion, saldo });

        res.redirect("/vistas/proyectos");
    } catch (error) {
        const mensaje = error.status === 400
            ? error.message
            : "Error al guardar el proyecto";
        res.status(error.status || 500).render("error", { mensaje });
    }
};

const renderProyectoDetalle = async (req, res, next) => {
    try {
        const proyecto = await obtenerProyectosId(req.params._id);
        const organizacion = await organizacionDelProyecto(proyecto);
        res.render("proyectoDetalle", { proyecto, organizacion });
    } catch (error) {
        next(mapearProyectoNoEncontrado(error));
    }
};

// Organización de un proyecto, incluidas las dadas de baja (para no perder
// el nombre en detalle/baja aunque el registro ya no esté activo).
const organizacionDelProyecto = async (proyecto) => {
    const organizaciones = await obtenerOrganizaciones({ incluirBajas: true });
    return organizaciones.find((o) => o.idOrganizacion === proyecto.idOrganizacion) ?? null;
};

// obtenerProyectosId lanza un Error simple sin status: acá lo convertimos en 404 real
// para que errorHandler muestre "Proyecto no encontrado" y no un 500 genérico.
const mapearProyectoNoEncontrado = (error) =>
    error.message === "Proyecto no encontrado"
        ? new AppError(404, "Proyecto no encontrado")
        : error;

const renderEditarProyecto = async (req, res, next) => {
    try {
        const proyecto = await obtenerProyectosId(req.params._id);
        const organizaciones = await organizacionesParaFormulario(proyecto.idOrganizacion);
        res.render("proyectoEditar", { proyecto, organizaciones });
    } catch (error) {
        next(mapearProyectoNoEncontrado(error));
    }
};

const guardarEdicionProyecto = async (req, res, next) => {
    try {
        const { idOrganizacion, nomProyecto, descripcion, saldo } = req.body;

        // Si "saldo" viene vacío, actualizarProyecto lo omite y conserva el historial
        await actualizarProyecto(req.params._id, { idOrganizacion, nomProyecto, descripcion, saldo });

        res.redirect("/vistas/proyectos");
    } catch (error) {
        next(mapearProyectoNoEncontrado(error));
    }
};

const renderEliminarProyecto = async (req, res, next) => {
    try {
        const proyecto = await obtenerProyectosId(req.params._id);
        const organizacion = await organizacionDelProyecto(proyecto);
        res.render("proyectoEliminar", { proyecto, organizacion });
    } catch (error) {
        next(mapearProyectoNoEncontrado(error));
    }
};

const eliminarProyectoVista = async (req, res, next) => {
    try {
        await eliminarProyecto(req.params._id);
        res.redirect("/vistas/proyectos");
    } catch (error) {
        next(error.statusCode === 404
            ? new AppError(404, "Proyecto no encontrado")
            : error);
    }
};

/* ===================== ORGANIZACIONES (MongoDB) ===================== */
// Todas las vistas de organizaciones identifican el registro por su _id de MongoDB (req.params._id).

const esAdmin = (res) => res.locals.currentUser?.role === "admin";

const renderOrganizaciones = async (req, res) => {
    try {
        // Por defecto solo activas. Un admin puede pedir ver también las dadas de baja
        // (?incluirBajas=true) para poder reactivarlas desde el listado.
        const incluirBajas = req.query.incluirBajas === "true" && esAdmin(res);
        const organizaciones = await obtenerOrganizaciones({ incluirBajas });
        res.render("organizaciones", { organizaciones, incluirBajas });
    } catch (error) {
        res.status(500).send("Error al cargar organizaciones");
    }
};

const renderCrearOrganizacion = (req, res) => {
    res.render("organizacionesCrear");
};

// Si el error del servicio corresponde a un campo del formulario, devuelve el nombre de ese campo.
// Hoy el único caso es el CUIL repetido (409). El formulario lo muestra como globito del navegador
// sobre ese campo; cualquier otro error va a la pantalla de error.
const campoDelError = (error) =>
    error instanceof AppError && error.status === 409 && /CUIL/i.test(error.message) ? "cuil" : null;

const guardarOrganizacionDesdeVista = async (req, res) => {
    try {
        // Mismas validaciones que usa la API
        const { errores, datos, erroresPorCampo } = validarDatosOrganizacion(req.body);
        if (errores.length > 0) {
            // Vuelve al mismo formulario con lo que ya se había escrito; cada error aparece como
            // globito del navegador sobre su campo
            return res.status(400).render("organizacionesCrear", { erroresCampo: erroresPorCampo, valores: req.body });
        }

        // Controla CUIL duplicado y guarda en Mongo (MongoDB genera el _id)
        await crearOrganizacion(datos);

        res.redirect("/vistas/organizaciones");
    } catch (error) {
        const campo = campoDelError(error);
        if (campo) {
            return res.status(error.status).render("organizacionesCrear", { erroresCampo: { [campo]: error.message }, valores: req.body });
        }
        if (error instanceof AppError) {
            return res.status(error.status).render("error", { mensaje: error.message });
        }
        console.error("Error al guardar la organización:", error);
        res.status(500).render("error", { mensaje: "Error al guardar la organización" });
    }
};

/* ============ ORGANIZACIONES: detalle / edición / baja lógica / reactivación (vistas) ============ */

const organizacionNoEncontrada = () => new AppError(404, "Organización no encontrada");

// El detalle también muestra las organizaciones dadas de baja (para poder reactivarlas)
const renderOrganizacionDetalle = async (req, res, next) => {
    try {
        const organizacion = await obtenerOrganizacionPorId(req.params._id, { incluirBajas: true });
        if (!organizacion) throw organizacionNoEncontrada();
        console.log(organizacion)
        res.render("organizacionDetalle", { organizacion });
    } catch (error) {
        next(error);
    }
};

// Devuelve null si la organización no existe o está dada de baja (baja lógica)
const renderEditarOrganizacion = async (req, res, next) => {
    try {
        const organizacion = await obtenerOrganizacionPorId(req.params._id);
        if (!organizacion) throw organizacionNoEncontrada();
        res.render("organizacionEditar", { organizacion });
    } catch (error) {
        next(error);
    }
};

const guardarEdicionOrganizacion = async (req, res, next) => {
    try {
        // Mismas validaciones que la API y que la creación desde la vista
        const { errores, datos, erroresPorCampo } = validarDatosOrganizacion(req.body);
        if (errores.length > 0) {
            // Vuelve al mismo formulario de edición con lo que se había escrito; cada error aparece
            // como globito del navegador sobre su campo
            return res.status(400).render("organizacionEditar", {
                organizacion: { ...req.body, _id: req.params._id },
                erroresCampo: erroresPorCampo
            });
        }

        // actualiza solo organizaciones activas; null = no existe o dada de baja
        const organizacion = await actualizarOrganizacion(req.params._id, datos);
        if (!organizacion) throw organizacionNoEncontrada();

        res.redirect("/vistas/organizaciones");
    } catch (error) {
        const campo = campoDelError(error);
        if (campo) {
            return res.status(error.status).render("organizacionEditar", {
                organizacion: { ...req.body, _id: req.params._id },
                erroresCampo: { [campo]: error.message }
            });
        }
        next(error);
    }
};

const renderEliminarOrganizacion = async (req, res, next) => {
    try {
        const organizacion = await obtenerOrganizacionPorId(req.params._id);
        if (!organizacion) throw organizacionNoEncontrada();
        res.render("organizacionEliminar", { organizacion });
    } catch (error) {
        next(error);
    }
};

// BAJA LÓGICA: no borra el documento, lo marca como inactiva (serviceOrganizacion.js)
const eliminarOrganizacionVista = async (req, res, next) => {
    try {
        const baja = await darDeBajaOrganizacion(req.params._id);
        if (!baja) throw organizacionNoEncontrada();
        res.redirect("/vistas/organizaciones");
    } catch (error) {
        next(error);
    }
};

// REACTIVACIÓN: pantalla de confirmación (solo para organizaciones dadas de baja)
const renderReactivarOrganizacion = async (req, res, next) => {
    try {
        const organizacion = await obtenerOrganizacionPorId(req.params._id, { incluirBajas: true });
        if (!organizacion) throw organizacionNoEncontrada();
        if (organizacion.activa !== false) throw new AppError(409, "La organización ya está activa");
        res.render("organizacionReactivar", { organizacion });
    } catch (error) {
        next(error);
    }
};

// Revierte la baja lógica (activa = true, fechaBaja = null) y vuelve al listado
const reactivarOrganizacionVista = async (req, res, next) => {
    try {
        const reactivada = await reactivarOrganizacion(req.params._id);
        if (!reactivada) throw organizacionNoEncontrada();
        res.redirect("/vistas/organizaciones");
    } catch (error) {
        next(error);
    }
};

/* ===================== GASTOS (MongoDB) ===================== */

const renderGastos = async (req, res) => {
    try {
        const [gastos, proyectos] = await Promise.all([obtenerGastos(), obtenerProyectos()]);
        const nombresProyecto = new Map(proyectos.map((p) => [p.idProyecto, p.nomProyecto]));
        const filas = gastos.map((g) => ({
            ...g,
            nombreProyecto: nombresProyecto.get(g.idProyecto) ?? null
        }));
        res.render("gastos", { gastos: filas });
    } catch (error) {
        res.status(500).send("Error al cargar gastos");
    }
};
const renderCrearGasto = async (req, res, next) => {
    try {
        const proyectos = await obtenerProyectos();
        res.render("gastosCrear", { proyectos });
    } catch (error) {
        next(error);
    }
};

const guardarGastoDesdeVista = async (req, res) => {
    try {
        const { idProyecto, descripcion, monto, fecha } = req.body;
        await crearGasto({ idProyecto: Number(idProyecto) , descripcion, monto: Number(monto) , fecha });
        res.redirect("/vistas/gastos");
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.status).render("error", { mensaje: error.message });
        }
        res.status(500).send("Error al guardar el gasto");
    }
};

// Devuelve null si el gasto no existe: se convierte en 404 real para que
// errorHandler muestre "Gasto no encontrado" y no un 500 genérico.
const gastoNoEncontrado = () => new AppError(404, "Gasto no encontrado");

const renderGastoDetalle = async (req, res, next) => {
    try {
        const gasto = await obtenerGastoPorId(req.params.id);
        if (!gasto) throw gastoNoEncontrado();
        const proyecto = await proyectoDelGasto(gasto);
        res.render("gastoDetalle", { gasto, proyecto });
    } catch (error) {
        next(error);
    }
};

// Proyecto de un gasto (sólo activos: el servicio de gastos valida ese mismo conjunto).
const proyectoDelGasto = async (gasto) => {
    const proyectos = await obtenerProyectos();
    return proyectos.find((p) => p.idProyecto === gasto.idProyecto) ?? null;
};

const renderGastoEditar = async (req, res, next) => {
    try {
        const gasto = await obtenerGastoPorId(req.params.id);
        if (!gasto) throw gastoNoEncontrado();
        const proyectos = await obtenerProyectos();
        res.render("gastoEditar", { gasto, proyectos });
    } catch (error) {
        next(error);
    }
};

const guardarEdicionGasto = async (req, res, next) => {
    try {
        const { idProyecto, descripcion, monto, fecha } = req.body;
        // El servicio valida proyecto existente/activo y tope de saldo disponible
        const gasto = await actualizarGasto(req.params.id, {
            idProyecto: Number(idProyecto),
            descripcion,
            monto: Number(monto),
            fecha
        });
        if (!gasto) throw gastoNoEncontrado();
        res.redirect("/vistas/gastos");
    } catch (error) {
        next(error);
    }
};

const renderGastoEliminar = async (req, res, next) => {
    try {
        const gasto = await obtenerGastoPorId(req.params.id);
        if (!gasto) throw gastoNoEncontrado();
        const proyecto = await proyectoDelGasto(gasto);
        res.render("gastoEliminar", { gasto, proyecto });
    } catch (error) {
        next(error);
    }
};

// BORRADO FÍSICO: mismo criterio que DELETE /gastos/:id (serviceGastos.eliminarGasto)
const eliminarGastoVista = async (req, res, next) => {
    try {
        const eliminado = await eliminarGasto(req.params.id);
        if (!eliminado) throw gastoNoEncontrado();
        res.redirect("/vistas/gastos");
    } catch (error) {
        next(error);
    }
};


/* ===================== DONACIONES ===================== */

const renderDonaciones = async (req, res) => {
    try {
        const [donaciones, proyectos, donantes, organizaciones] = await Promise.all([
            obtenerDonaciones(),
            obtenerProyectos(),
            obtenerDonantes(),
            obtenerOrganizaciones({ incluirBajas: true })
        ]);
        const nombresProyecto = new Map(proyectos.map((p) => [p.idProyecto, p.nomProyecto]));
        const nombresDonante = new Map(donantes.map((d) => [d.idDonante, `${d.nombre} ${d.apellido}`]));
        const nombresOrg = new Map(organizaciones.map((o) => [o.idOrganizacion, o.nombre]));
        const filas = donaciones.map((d) => ({
            ...d,
            nombreProyecto: nombresProyecto.get(d.idProyecto) ?? null,
            nombreDonante: nombresDonante.get(d.idDonante) ?? null,
            nombreOrganizacion: nombresOrg.get(d.idOrganizacion) ?? null
        }));
        res.render("donaciones", { donaciones: filas });
    } catch (error) {
        res.status(500).send("Error al cargar donaciones");
    }
};

const renderCrearDonacion = async (req, res, next) => {
    try {
        const [proyectos, donantes, organizaciones] = await Promise.all([
            obtenerProyectos(),
            obtenerDonantes(),
            obtenerOrganizaciones()
        ]);
        res.render("donacionesCrear", { proyectos, donantes, organizaciones });
    } catch (error) {
        next(error);
    }
};

const guardarDonacionDesdeVista = async (req, res) => {
    try {
        const { monto, cbu, fecha, idProyecto, idDonante, idOrganizacion } = req.body;
        await crearDonacion({
            monto: Number(monto),
            cbu,
            fecha,
            idProyecto: Number(idProyecto),
            idDonante: Number(idDonante),
            idOrganizacion: Number(idOrganizacion)
        });
        res.redirect("/vistas/donaciones");
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.status).render("error", { mensaje: error.message });
        }
        res.status(500).send("Error al guardar la donación");
    }
};

const donacionNoEncontrada = () => new AppError(404, "Donación no encontrada");

const renderDonacionDetalle = async (req, res, next) => {
    try {
        const donacion = await obtenerDonacionPorId(req.params.id);
        if (!donacion) throw donacionNoEncontrada();
        const relaciones = await relacionesDeDonacion(donacion);
        res.render("donacionDetalle", { donacion, ...relaciones });
    } catch (error) {
        next(error);
    }
};

// Proyecto, donante y organización de una donación. Las organizaciones se
// traen incluyendo bajas para conservar el nombre; si no existe el registro
// la vista cae en el fallback "#(id)".
const relacionesDeDonacion = async (donacion) => {
    const [proyectos, donantes, organizaciones] = await Promise.all([
        obtenerProyectos(),
        obtenerDonantes(),
        obtenerOrganizaciones({ incluirBajas: true })
    ]);
    return {
        proyecto: proyectos.find((p) => p.idProyecto === donacion.idProyecto) ?? null,
        donante: donantes.find((d) => d.idDonante === donacion.idDonante) ?? null,
        organizacion: organizaciones.find((o) => o.idOrganizacion === donacion.idOrganizacion) ?? null
    };
};

const renderEditarDonacion = async (req, res, next) => {
    try {
        const donacion = await obtenerDonacionPorId(req.params.id);
        if (!donacion) throw donacionNoEncontrada();
        const [proyectos, donantes, organizaciones] = await Promise.all([
            obtenerProyectos(),
            obtenerDonantes(),
            obtenerOrganizaciones()
        ]);
        res.render("donacionEditar", { donacion, proyectos, donantes, organizaciones });
    } catch (error) {
        next(error);
    }
};

const guardarEdicionDonacion = async (req, res, next) => {
    try {
        const { monto, cbu, fecha, idProyecto, idDonante, idOrganizacion } = req.body;
        const donacion = await actualizarDonacion(req.params.id, {
            monto: Number(monto),
            cbu,
            fecha,
            idProyecto: Number(idProyecto),
            idDonante: Number(idDonante),
            idOrganizacion: Number(idOrganizacion)
        });
        if (!donacion) throw donacionNoEncontrada();
        res.redirect("/vistas/donaciones");
    } catch (error) {
        next(error);
    }
};

const renderEliminarDonacion = async (req, res, next) => {
    try {
        const donacion = await obtenerDonacionPorId(req.params.id);
        if (!donacion) throw donacionNoEncontrada();
        const relaciones = await relacionesDeDonacion(donacion);
        res.render("donacionEliminar", { donacion, ...relaciones });
    } catch (error) {
        next(error);
    }
};

const eliminarDonacionVista = async (req, res, next) => {
    try {
        const donacion = await eliminarDonacion(req.params.id);
        if (!donacion) throw donacionNoEncontrada();
        res.redirect("/vistas/donaciones");
    } catch (error) {
        next(error);
    }
};

const renderDonantes = async (req, res) => {
    try {
        const donantes = await obtenerDonantes();
        res.render("donantes", { donantes });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al cargar donantes");
    }
};

const renderCrearDonante = (req, res) => {
    res.render("donantesCrear");
};

const guardarDonanteDesdeVista = async (req, res) => {
    try {
      await insertarDonante(req.body);
        res.redirect("/vistas/donantes");
    } catch (error) {
        //---------
        console.error("ERROR AL GUARDAR DONANTE:", error);
        res.status(500).send("Error al guardar el donante");
    }
};

// obtenerDonantesId lanza un Error simple sin status: acá lo convertimos en 404 real
// para que errorHandler muestre "Donante no encontrado" y no un 500 genérico.
const mapearDonanteNoEncontrado = (error) =>
    error.message === "Donante no encontrado"
        ? new AppError(404, "Donante no encontrado")
        : error;

const renderDonanteDetalle = async (req, res, next) => {
    try {
        const donante = await obtenerDonantesId(req.params.id);
        res.render("donanteDetalle", { donante });
    } catch (error) {
        next(mapearDonanteNoEncontrado(error));
    }
};

const renderDonanteEditar = async (req, res, next) => {
    try {
        const donante = await obtenerDonantesId(req.params.id);
        res.render("donanteEditar", { donante });
    } catch (error) {
        next(mapearDonanteNoEncontrado(error));
    }
};

const guardarEdicionDonante = async (req, res, next) => {
    try {
        const { nombre, apellido, dni, telefono, email, monto, fecha } = req.body;
        // El service normaliza strings/Number/Date según el schema del donante
        const donante = await actualizarDonante(req.params.id, {
            nombre, apellido, dni, telefono, email, monto: Number(monto), fecha
        });
        if (!donante) throw new AppError(404, "Donante no encontrado");
        res.redirect("/vistas/donantes");
    } catch (error) {
        next(mapearDonanteNoEncontrado(error));
    }
};

const renderDonanteEliminar = async (req, res, next) => {
    try {
        const donante = await obtenerDonantesId(req.params.id);
        res.render("donanteEliminar", { donante });
    } catch (error) {
        next(mapearDonanteNoEncontrado(error));
    }
};

// BORRADO FÍSICO: mismo criterio que DELETE /donantes/:id (serviceDonante.eliminarDonante)
const eliminarDonanteVista = async (req, res, next) => {
    try {
        await eliminarDonante(req.params.id);
        res.redirect("/vistas/donantes");
    } catch (error) {
        next(mapearDonanteNoEncontrado(error));
    }
};

export {
    renderHome,
    renderProyectos,
    renderCrearProyecto,
    guardarProyectoDesdeVista,
    renderProyectoDetalle,
    renderEditarProyecto,
    guardarEdicionProyecto,
    renderEliminarProyecto,
    eliminarProyectoVista,
    renderOrganizaciones,
    renderCrearOrganizacion,
    guardarOrganizacionDesdeVista,
    renderOrganizacionDetalle,
    renderEditarOrganizacion,
    guardarEdicionOrganizacion,
    renderEliminarOrganizacion,
    eliminarOrganizacionVista,
    renderReactivarOrganizacion,
    reactivarOrganizacionVista,
    renderGastos,
    renderCrearGasto,
    guardarGastoDesdeVista,
    renderGastoDetalle,
    renderGastoEditar,
    guardarEdicionGasto,
    renderGastoEliminar,
    eliminarGastoVista,
    renderDonaciones,
    renderCrearDonacion,
    guardarDonacionDesdeVista,
    renderDonacionDetalle,
    renderEditarDonacion,
    guardarEdicionDonacion,
    renderEliminarDonacion,
    eliminarDonacionVista,
    renderDonantes,
    renderCrearDonante,
    guardarDonanteDesdeVista,
    renderDonanteDetalle,
    renderDonanteEditar,
    guardarEdicionDonante,
    renderDonanteEliminar,
    eliminarDonanteVista
};
