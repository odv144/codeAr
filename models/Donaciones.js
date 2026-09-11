class Donacion {
    constructor(idDonacion, monto, cbu, fecha, idProyecto, idDonante, idOrganizacion) {
        this.idDonacion = idDonacion;
        this.monto = monto;
        this.cbu = cbu;
        this.fecha = fecha;
        this.idProyecto = idProyecto;
        this.idDonante = idDonante;
        this.idOrganizacion = idOrganizacion;
    }
}
module.exports = Donacion;