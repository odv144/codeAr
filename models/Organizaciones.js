class Organizacion {
    constructor(
        idOrganizacion,
        nombre,
        tipo,
        cuil,
        telefono,
        mail,
        direccion,
        responsable
    ) {
        this.idOrganizacion = idOrganizacion;
        this.nombre = nombre;
        this.tipo = tipo;
        this.cuil = cuil;
        this.telefono = telefono;
        this.mail = mail;
        this.direccion = direccion;
        this.responsable = responsable;
    }
}

module.exports = Organizacion;