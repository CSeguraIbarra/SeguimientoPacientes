class PacienteTratamiento {
    constructor(id, idpaciente, idtratamiento,idmedico, fecha_inicio, fecha_fin,estado) {
        this.id = id;
        this.idpaciente = idpaciente;
        this.idtratamiento = idtratamiento;
        this.idmedico=idmedico;
        this.fecha_inicio = fecha_inicio;
        this.fecha_fin = fecha_fin;
        this.estado=estado;
    }

    // Puedes agregar métodos específicos si es necesario
}

module.exports = PacienteTratamiento;
