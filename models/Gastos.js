class Gasto {
    constructor(
        idGasto,
        idProyecto,
        descripcion,
        monto,
        fecha
    ) {
        this.idGasto = idGasto;
        this.idProyecto = idProyecto;
        this.descripcion = descripcion;
        this.monto = monto;
        this.fecha = fecha;
    }
}

module.exports = Gasto;
