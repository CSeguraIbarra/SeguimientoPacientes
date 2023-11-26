class Paciente {
    constructor(id, idusuario, nombre, apellidos, fecha_nacimiento, sexo, telefono) {
        this.id = id;
        this.idusuario = idusuario;
        this.nombre = nombre;
        this.apellidos = apellidos;
        this.fecha_nacimiento = fecha_nacimiento;
        this.sexo = sexo;
        this.telefono = telefono;
    }
}

module.exports = Paciente;
