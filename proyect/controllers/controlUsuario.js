const Usuario = require('../models/usuario.js');
const Database = require('../database/database.js');

class ControlUsuario {
    constructor() {
        this.usuariosBD = new Database();
    }

    adicionarUsuario(usuario) {
        this.usuariosBD.addUsuario(usuario);
    }

    modificarUsuario(id, usuario) {
        this.usuariosBD.updateUsuario(id, usuario);
    }

    eliminarUsuario(id) {
        this.usuariosBD.deleteUsuario(id);
    }

    async accesoPermitido(cuenta, clave) {
        const usuarios = await this.usuariosBD.getAllUsuarios();
        for (let i = 0; i < usuarios.length; i++) {
            const usuario = usuarios[i];
            if (usuario.cuenta === cuenta && usuario.claveValida(clave)) {
                return usuario;
            }
        }
        return null;
    }

    async cargarUsuarios() {
        const usuarios = [
            [1, "Neymar", "neymar11", "1234", "ney11@gmail.com", "enfermero"],
            [2, "Rodri", "rodri", "1537", "rodri@gmail.com", "medico"],
            [3, "Asencio", "ase123", "1467", "asencio@gmail.com", "paciente"],
            [4, "Pedri", "pedri", "7843", "pedri@gmail.com", "medico"],
            [5, "Aurelian", "au12", "7321", "aur@gmail.com", "paciente"],
        ];

        for (let i = 0; i < usuarios.length; i++) {
            const user = new Usuario(usuarios[i][0], usuarios[i][1], usuarios[i][2], usuarios[i][3], usuarios[i][4], usuarios[i][5]);
            await this.adicionarUsuario(user);
            //await ->se utiliza para esperar a que una operación asíncrona, como una consulta a la base de datos, se complete antes de continuar con el código.
        }
    }

    async getAllUsuarios() {
        return new Promise((resolve, reject) => {
            this.usuariosBD.getAllUsuarios((users) => {
                if (users) {
                    resolve(users);
                    //resolve retorna un objeto Promise que es resulto con un valor dado
                } else {
                    reject(new Error("No se pudieron recuperar los usuarios"));
                    //retorna un objeto Promise que es rechazado por la razón específicada
                }
            });
        });
    }
    async getById(id) {
        return new Promise(async (resolve, reject) => {
                const usuarios =await this.getAllUsuarios();
                for (let i = 0; i < usuarios.length; i++) {
                    if (usuarios[i].id == id) {
                        resolve(usuarios[i]);
                        return; // Importante agregar un return aquí para salir del bucle si se encuentra el usuario
                    }
                }
                reject(new Error("No se encontró el usuario"));
        });
    }


}
/*Cuando una función está marcada como async, puede contener la palabra clave await dentro de su cuerpo. La palabra clave await se utiliza para esperar a que una Promesa se resuelva o se rechace. Esto permite que el código asíncrono se vea y se comporte de manera más similar al código síncrono tradicional.*/
module.exports = ControlUsuario;
