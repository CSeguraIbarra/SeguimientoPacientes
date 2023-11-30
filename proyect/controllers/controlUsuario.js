const Usuario = require('../models/usuario.js');
const Medico = require('../models/medico.js');// en caso de que se quiera cargar medicos por codigo
const Paciente = require('../models/paciente.js');
const Tratamiento = require('../models/tratamiento.js');
const PacienteTratamiento = require('../models/pacienteTratamiento.js');
const Database = require('../database/database.js');

class ControlUsuario {
    constructor() {
        this.db = new Database();
    }

    //LIMPIAR UNA TABLA
    limpiarTabla(nombre){
        return this.db.clearTable(nombre);
    }
    //eliminar una tabla
    eliminarTabla(nombre){
        return this.db.deleteTable(nombre);
    }
    // CRUD para usuarios

    adicionarUsuario(usuario) {
        return this.db.addUsuario(usuario);
    }

    modificarUsuario(id, usuario) {
        return this.db.updateUsuario(id, usuario);
    }

    eliminarPaciente(id){
        return this.bd.deletePaciente(id);
    }
    /*eliminarUsuario(id) {
        return this.db.deleteUsuario(id);
    }*/

    // En tu clase ControlUsuario
    async eliminarUsuario(id) {
            const usuario = await this.getById(id);

            // Eliminar usuario principal
            await this.db.deleteUsuario(id);

            // Eliminar registros relacionados en base al rol
            if (usuario.rol === 'medico') {
                const medico = await this.getMedico(id);
                if (medico) {
                    this.eliminarMedico(medico.id);
                }
            } else if (usuario.rol === 'paciente') {
                const paciente = await this.getPaciente(id);
                if (paciente) {
                    this.eliminarPaciente(paciente.id);
                }
            }
    }

    // Añadir estas funciones al ControlUsuario
    async getMedicoByUsuarioId(idUsuario) {
        const medicos = await this.getAllMedicos();
        return medicos.find(medico => medico.idusuario === idUsuario);
    }

    async getPacienteByUsuarioId(idUsuario) {
        const pacientes = await this.getAllPacientes();
        return pacientes.find(paciente => paciente.idusuario === idUsuario);
    }


    async accesoPermitido(cuenta, clave) {
        try {
            const usuarios = await this.getAllUsuarios();
            const usuario = usuarios.find(u => u.cuenta === cuenta && u.clave === clave);
            return usuario || null;
        } catch (error) {
            throw error;
        }
    }

    async cargarUsuarios() {
        const usuariosData = [
            [1, "Neymar", "neymar11", "1234", "ney11@gmail.com", "enfermero"],
            [2, "Rodri", "rodri", "1537", "rodri@gmail.com", "medico"],
            [3, "Asencio", "ase123", "1467", "asencio@gmail.com", "paciente"],
            [4, "Pedri", "pedri", "7843", "pedri@gmail.com", "medico"],
            [5, "Aurelian", "au12", "7321", "aur@gmail.com", "paciente"],
        ];

        for (const userData of usuariosData) {
            const user = new Usuario(...userData);
            await this.adicionarUsuario(user);
        }
    }

    async getAllUsuarios() {
        return new Promise((resolve, reject) => {
            this.db.getAllUsuarios((users) => {
                if (users) {
                    resolve(users);
                } else {
                    reject(new Error("No se pudieron recuperar los usuarios"));
                }
            });
        });
    }

    async getAllUsuariosByRol(rol) {
        try {
            const usuarios = await this.getAllUsuarios();
            return usuarios.filter(u => u.rol === rol);
        } catch (error) {
            throw error;
        }
    }


    async getById(id) {
        const usuarios = await this.getAllUsuarios();
        const usuario = usuarios.find(u => u.id == id);
        if (usuario) {
            return usuario;
        } else {
            throw new Error("No se encontró el usuario");
        }
    }

    async iniciarSesion(req, usuario) {
        req.session.usuario = usuario;
    }

    async cerrarSesion(req) {
        req.session.destroy();
    }

    async getUserInsertID() {
        return this.db.getUserInsertID(); 
    }

    // CRUD para médicos
    adicionarMedico(medico) {
        return this.db.addMedico(medico);
    }

    modificarMedico(id, medico) {
        return this.db.updateMedico(id, medico);
    }

    eliminarMedico(id) {
        return this.db.deleteMedico(id);
    }

    async getAllMedicos() {
        return new Promise((resolve, reject) => {
            this.db.getAllMedicos((medicos) => {
                if (medicos) {
                    resolve(medicos);
                } else {
                    reject(new Error("No se pudieron recuperar los médicos"));
                }
            });
        });
    }

    async getMedico(idusuario) {
        const medicos = await this.getAllMedicos();
        const medico = medicos.find(m => m.idusuario == idusuario);
        if (medico) {
            return medico;
        } else {
            throw new Error("No se encontró el medico");
        }
    }
    async getByIdMedico(id) {
        const medicos = await this.getAllMedicos();
        const medico = medicos.find(m => m.id == id);
        if (medico) {
            return medico;
        } else {
            throw new Error("No se encontró el medico");
        }
    }

    // CRUD para pacientes
    adicionarPaciente(paciente) {
        return this.db.addPaciente(paciente);
    }

    modificarPaciente(id, paciente) {
        return this.db.updatePaciente(id, paciente);
    }

    eliminarPaciente(id) {
        return this.db.deletePaciente(id);
    }

    async getAllPacientes() {
        return new Promise((resolve, reject) => {
            this.db.getAllPacientes((pacientes) => {
                if (pacientes) {
                    resolve(pacientes);
                } else {
                    reject(new Error("No se pudieron recuperar los pacientes"));
                }
            });
        });
    }
    //buscar paciente por el id usuario
    async getPaciente(idusuario) {
        const pacientes = await this.getAllPacientes();
        const paciente = pacientes.find(p => p.idusuario == idusuario);
        if (paciente) {
            return paciente;
        } else {
            throw new Error("No se encontró el paciente");
        }
    }
    //buscar paciente por el id
    async getByIdPaciente(id) {
        const pacientes = await this.getAllPacientes();
        const paciente = pacientes.find(p => p.id == id);
        if (paciente) {
            return paciente;
        } else {
            throw new Error("No se encontró el paciente");
        }
    }
    //buscar usuario asociado al paciente
    async getUserAsociado(id){
        const usuarios=await this.getAllUsuarios();
        const paciente=await this.getByIdPaciente(id);
        const usuario=await usuarios.find(u => u.id==paciente.id);
        if(usuario){
            return paciente;
        }else{
            throw new Error("No se encontró el usuario asociado al id");
        }
    }

    // CRUD para tratamientos
    adicionarTratamiento(tratamiento) {
        return this.db.addTratamiento(tratamiento);
    }

    modificarTratamiento(id, tratamiento) {
        return this.db.updateTratamiento(id, tratamiento);
    }

    eliminarTratamiento(id) {
        return this.db.deleteTratamiento(id);
    }

    async getAllTratamientos() {
        return new Promise((resolve, reject) => {
            this.db.getAllTratamientos((tratamientos) => {
                if (tratamientos) {
                    resolve(tratamientos);
                } else {
                    reject(new Error("No se pudieron recuperar los tratamientos"));
                }
            });
        });
    }

    async getByIdTratamiento(id) {
        const tratamientos = await this.getAllTratamientos();
        const tratamiento = tratamientos.find(t => t.id == id);
        if (tratamiento) {
            return tratamiento;
        } else {
            throw new Error("No se encontró el usuario");
        }
    }

    // CRUD para paciente_tratamiento
    async adicionarPacienteTratamiento(pacienteTratamiento) {
        return this.db.addPacienteTratamiento(pacienteTratamiento);
    }

    async getAllPacienteTratamientos() {
        return new Promise((resolve, reject) => {
            this.db.getAllPacienteTratamientos((pacientesTratamientos) => {
                if (pacientesTratamientos) {
                    resolve(pacientesTratamientos);
                } else {
                    reject(new Error("No se pudieron recuperar los pacientesTratamientos"));
                }
            });
        });
    }

    async modificarPacienteTratamiento(id, pacienteTratamiento) {
        try {
            await this.db.updatePacienteTratamiento(id, pacienteTratamiento);
            console.log("Paciente_tratamiento actualizado con éxito");
        } catch (error) {
            throw error;
        }
    }

    async eliminarPacienteTratamiento(id) {
        try {
            await this.db.deletePacienteTratamiento(id);
            console.log("Paciente_tratamiento eliminado con éxito");
        } catch (error) {
            throw error;
        }
    }
    async getAllTratamientosAsignados(idpaciente){
        const pacienteTratamientos = await this.getAllPacienteTratamientos();
        const tratamientosAsignados = pacienteTratamientos.filter(pt => pt.idpaciente == idpaciente);
        
        if (tratamientosAsignados.length>0) {
            return tratamientosAsignados;
        } else {
            throw new Error("No se encontraron los tratamientos asignados al paciente");
        }
    }
    async getByIdPacienteTratamiento(id) {
        const pacienteTratamientos = await this.getAllPacienteTratamientos();
        const pacienteTratamiento = pacienteTratamientos.find(pt => pt.id == id);
        if (pacienteTratamiento) {
            return pacienteTratamiento;
        } else {
            throw new Error("No se encontró el tratamiento asociado");
        }
    }
}

module.exports = ControlUsuario;
