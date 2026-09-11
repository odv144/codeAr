class Donante {
    constructor(idDonante, nombre, apellido, dni, telefono, email, monto, fecha) {
        this.idDonante = idDonante;
        this.nombre = nombre;
        this.apellido = apellido;
        this.dni = dni;
        this.telefono = telefono;
        this.email = email;
        this.monto = monto;
        this.fecha = fecha;
    }
}
module.exports = Donante;