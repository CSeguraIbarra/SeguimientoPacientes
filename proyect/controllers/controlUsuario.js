const Usuario = require('../models/usuario.js');
const Database = require('../database/database.js');

class ControlUsuario {
    constructor() {
        this.usuariosBD = new Database();
    }

    adicionarUsuario(usuario) {
        return this.usuariosBD.addUsuario(usuario);
    }

    modificarUsuario(id, usuario) {
        return this.usuariosBD.updateUsuario(id, usuario);
    }

    eliminarUsuario(id) {
        return this.usuariosBD.deleteUsuario(id);
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
            this.usuariosBD.getAllUsuarios((users) => {
                if (users) {
                    resolve(users);
                } else {
                    reject(new Error("No se pudieron recuperar los usuarios"));
                }
            });
        });
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
}

module.exports = ControlUsuario;
