export function validarDatosDonacion(body = {}) {
    const errores = [];
    const datos = {};

    const { monto, cbu, fecha, idProyecto, idDonante, idOrganizacion } = body;

    if (monto === undefined || monto === null) {
        errores.push("El campo 'monto' es obligatorio");
    } else if (typeof monto !== "number" || !Number.isFinite(monto) || monto <= 0) {
        errores.push("El campo 'monto' debe ser un número mayor a 0");
    } else {
        datos.monto = monto;
    }

    if (cbu === undefined || cbu === null || (typeof cbu === "string" && cbu.trim() === "")) {
        errores.push("El campo 'cbu' es obligatorio");
    } else if (typeof cbu !== "string" || !/^\d{22}$/.test(cbu.trim())) {
        errores.push("El campo 'cbu' debe tener 22 dígitos numéricos");
    } else {
        datos.cbu = cbu.trim();
    }

    if (fecha === undefined || fecha === null || fecha === "") {
        errores.push("El campo 'fecha' es obligatorio");
    } else if (typeof fecha !== "string" || Number.isNaN(Date.parse(fecha))) {
        errores.push("El campo 'fecha' debe ser una fecha válida (ej. 2026-10-09)");
    } else {
        datos.fecha = fecha;
    }

    if (idProyecto === undefined || idProyecto === null) {
        errores.push("El campo 'idProyecto' es obligatorio");
    } else if (!Number.isInteger(idProyecto) || idProyecto < 1) {
        errores.push("El campo 'idProyecto' debe ser un número entero mayor o igual a 1");
    } else {
        datos.idProyecto = idProyecto;
    }

    if (idDonante === undefined || idDonante === null) {
        errores.push("El campo 'idDonante' es obligatorio");
    } else if (!Number.isInteger(idDonante) || idDonante < 1) {
        errores.push("El campo 'idDonante' debe ser un número entero mayor o igual a 1");
    } else {
        datos.idDonante = idDonante;
    }

    if (idOrganizacion === undefined || idOrganizacion === null) {
        errores.push("El campo 'idOrganizacion' es obligatorio");
    } else if (!Number.isInteger(idOrganizacion) || idOrganizacion < 1) {
        errores.push("El campo 'idOrganizacion' debe ser un número entero mayor o igual a 1");
    } else {
        datos.idOrganizacion = idOrganizacion;
    }

    return { errores, datos };
}