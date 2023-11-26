const sqlite3 = require('sqlite3').verbose();
const dbPath = "./seguridad.db";

class Database {

    constructor() {
        this.usuarios = [];
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Error al abrir la base de datos Seguridad:', err.message);
            } else {
                console.log('Conexión exitosa a la base de datos');
                this.crearTablas();
            }
        });
    }

    close() {
        this.db.close((err) => {
            if (err) {
                console.error('Error al cerrar la base de datos:', err.message);
            } else {
                console.log('Conexión de la base de datos Seguridad cerrada');
            }
        });
    }

    crearTablas() {
        const queryUser = 'CREATE TABLE IF NOT EXISTS usuario(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,fotografia_path TEXT NOT NULL, nombre TEXT NOT NULL, cuenta TEXT NOT NULL, clave TEXT NOT NULL, email TEXT, rol TEXT, estampa TIMESTAMP)';
        const queryPerfil = 'CREATE TABLE IF NOT EXISTS perfil(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, nombre TEXT NOT NULL, crud TEXT NOT NULL)';
        const queryAcceso = 'CREATE TABLE IF NOT EXISTS acceso(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, fecha TIMESTAMP, usuario INTEGER, accion TEXT)';
        const queryMedicos = 'CREATE TABLE IF NOT EXISTS medicos(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,idusuario INTEGER NOT NULL, nombre TEXT NOT NULL, apellidos TEXT NOT NULL, especialidad TEXT,FOREIGN KEY (idusuario) REFERENCES usuario(id))';
        const queryTratamientos = 'CREATE TABLE IF NOT EXISTS tratamientos(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, nombre TEXT NOT NULL, descripcion TEXT, observaciones TEXT)';
        const queryPacientes = 'CREATE TABLE IF NOT EXISTS pacientes(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, idusuario INTEGER NOT NULL, nombre TEXT NOT NULL, apellidos TEXT NOT NULL, fecha_nacimiento DATE, sexo TEXT, telefono TEXT, FOREIGN KEY (idusuario) REFERENCES usuario(id))';
        const queryPacienteTratamiento = 'CREATE TABLE IF NOT EXISTS paciente_tratamiento(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, idpaciente INTEGER NOT NULL, idtratamiento INTEGER NOT NULL, idmedico INTEGER NOT NULL, fecha_inicio DATE, fecha_fin DATE,estado TEXT NOT NULL, FOREIGN KEY (idpaciente) REFERENCES pacientes(id), FOREIGN KEY (idtratamiento) REFERENCES tratamientos(id), FOREIGN KEY (idmedico) REFERENCES medicos(id))';

        this.db.run(queryUser);
        this.db.run(queryPerfil);
        this.db.run(queryAcceso);
        this.db.run(queryMedicos);
        this.db.run(queryTratamientos);
        this.db.run(queryPacientes);
        this.db.run(queryPacienteTratamiento);
    }

    // Métodos CRUD para la tabla "usuarios"
    getAllUsuarios(callback) {
        const query = 'SELECT * FROM usuario';
        this.db.all(query, [], (err, rows) => {
            if (!err) {
                callback(rows);
            } else {
                console.error(err);
                callback([]);
            }
        });
    }

    addUsuario(usuario) {
        const query = 'INSERT INTO usuario (fotografia_path,nombre,cuenta, clave, email, rol, estampa) VALUES (?, ?,?, ?, ?, ? ,?)';
        const params = [usuario.fotografia_path, usuario.nombre, usuario.cuenta, usuario.clave, usuario.email, usuario.rol, usuario.estampa];
        this.db.serialize(() => {
            this.db.run(query, params, function (err) {
                if (err) console.log(err.message);
                else console.log("Nuevo usuario creado con éxito");
            });
        });
    }

    updateUsuario(id, usuario) {
        const query = 'UPDATE usuario SET fotografia_path=? nombre = ?, cuenta = ?, clave = ?, email = ? , rol = ? , estampa = ? WHERE id = ?';
        const params = [usuario.fotografia_path,usuario.nombre, usuario.cuenta, usuario.clave, usuario.email, usuario.rol, new Date(), id];
        this.db.run(query, params, function (err) {
            if (err) console.log(err.message);
            else console.log("Usuario actualizado con éxito");
        });
    }

    deleteUsuario(id) {
        const query = 'DELETE FROM usuario WHERE id = ?';
        this.db.run(query, id, (err) => {
            if (err) {
                console.log(err.message);
            } else {
                console.log("Usuario eliminado con éxito");
                this.reorganizarIDs();
            }
        });
    }

    // Métodos CRUD para la tabla "medicos"
    getAllMedicos(callback) {
        const query = 'SELECT * FROM medicos';
        this.db.all(query, [], (err, rows) => {
            if (!err) {
                callback(rows);
            } else {
                console.error(err);
                callback([]);
            }
        });
    }

    addMedico(medico) {
        const query = 'INSERT INTO medicos (idusuario, nombre, apellidos, especialidad) VALUES (?, ?, ?, ?)';
        const params = [medico.idusuario, medico.nombre, medico.apellidos, medico.especialidad];
        this.db.serialize(() => {
            this.db.run(query, params, function (err) {
                if (err) console.log(err.message);
                else console.log("Nuevo médico creado con éxito");
            });
        });
    }

    updateMedico(id, medico) {
        const query = 'UPDATE medicos SET idusuario = ?, nombre = ?, apellidos = ?, especialidad = ? WHERE id = ?';
        const params = [medico.idusuario, medico.nombre, medico.apellidos, medico.especialidad, id];
        this.db.run(query, params, function (err) {
            if (err) console.log(err.message);
            else console.log("Médico actualizado con éxito");
        });
    }

    deleteMedico(id) {
        const query = 'DELETE FROM medicos WHERE id = ?';
        this.db.run(query, id, (err) => {
            if (err) {
                console.log(err.message);
            } else {
                console.log("Médico eliminado con éxito");
                this.reorganizarIDs(); //reorganizar
            }
        });
    }

    // Métodos CRUD para la tabla "pacientes"
    getAllPacientes(callback) {
        const query = 'SELECT * FROM pacientes';
        this.db.all(query, [], (err, rows) => {
            if (!err) {
                callback(rows);
            } else {
                console.error(err);
                callback([]);
            }
        });
    }

    addPaciente(paciente) {
        const query = 'INSERT INTO pacientes (idusuario, nombre, apellidos, fecha_nacimiento, sexo, telefono) VALUES (?, ?, ?, ?, ?, ?)';
        const params = [paciente.idusuario, paciente.nombre, paciente.apellidos, paciente.fecha_nacimiento, paciente.sexo, paciente.telefono];
        this.db.serialize(() => {
            this.db.run(query, params, function (err) {
                if (err) console.log(err.message);
                else console.log("Nuevo paciente creado con éxito");
            });
        });
    }

    updatePaciente(id, paciente) {
        const query = 'UPDATE pacientes SET idusuario = ?, nombre = ?, apellidos = ?, fecha_nacimiento = ?, sexo = ?, telefono = ? WHERE id = ?';
        const params = [paciente.idusuario, paciente.nombre, paciente.apellidos, paciente.fecha_nacimiento, paciente.sexo, paciente.telefono, id];
        this.db.run(query, params, function (err) {
            if (err) console.log(err.message);
            else console.log("Paciente actualizado con éxito");
        });
    }

    deletePaciente(id) {
        const query = 'DELETE FROM pacientes WHERE id = ?';
        this.db.run(query, id, (err) => {
            if (err) {
                console.log(err.message);
            } else {
                console.log("Paciente eliminado con éxito");
                this.reorganizarIDs(); //reorganizar
            }
        });
    }

    // Métodos CRUD para la tabla "tratamientos"
    getAllTratamientos(callback) {
        const query = 'SELECT * FROM tratamientos';
        this.db.all(query, [], (err, rows) => {
            if (!err) {
                callback(rows);
            } else {
                console.error(err);
                callback([]);
            }
        });
    }

    addTratamiento(tratamiento) {
        const query = 'INSERT INTO tratamientos (nombre, descripcion, observaciones) VALUES (?, ?, ?)';
        const params = [tratamiento.nombre, tratamiento.descripcion, tratamiento.observaciones];
        this.db.serialize(() => {
            this.db.run(query, params, function (err) {
                if (err) console.log(err.message);
                else console.log("Nuevo tratamiento creado con éxito");
            });
        });
    }

    updateTratamiento(id, tratamiento) {
        const query = 'UPDATE tratamientos SET nombre = ?, descripcion = ?,observaciones = ? WHERE id = ?';
        const params = [tratamiento.nombre, tratamiento.descripcion, tratamiento.observaciones, id];
        this.db.run(query, params, function (err) {
            if (err) console.log(err.message);
            else console.log("Tratamiento actualizado con éxito");
        });
    }

    deleteTratamiento(id) {
        const query = 'DELETE FROM tratamientos WHERE id = ?';
        this.db.run(query, id, (err) => {
            if (err) {
                console.log(err.message);
            } else {
                console.log("Tratamiento eliminado con éxito");
                this.reorganizarIDs();//reorganizar
            }
        });
    }

    //CRUD para paciente_tratamientos
    getAllPacienteTratamientos(callback) {
        const query = 'SELECT * FROM paciente_tratamiento';
        this.db.all(query, [], (err, rows) => {
            if (!err) {
                callback(rows);
            } else {
                console.error(err);
                callback([]);
            }
        });
    }

    addPacienteTratamiento(pacienteTratamiento) {
        const query = 'INSERT INTO paciente_tratamiento (idpaciente, idtratamiento, idmedico, fecha_inicio, fecha_fin,estado) VALUES (?, ?, ?, ?, ?,?)';
        const params = [pacienteTratamiento.idpaciente, pacienteTratamiento.idtratamiento, pacienteTratamiento.idmedico, pacienteTratamiento.fecha_inicio, pacienteTratamiento.fecha_fin,pacienteTratamiento.estado];
        this.db.serialize(() => {
            this.db.run(query, params, function (err) {
                if (err) console.log(err.message);
                else console.log("Nuevo registro paciente_tratamiento creado con éxito");
            });
        });
    }

    updatePacienteTratamiento(id, pacienteTratamiento) {
        const query = 'UPDATE paciente_tratamiento SET idpaciente = ?, idtratamiento = ?, idmedico = ?, fecha_inicio = ?, fecha_fin = ?, estado=? WHERE id = ?';
        const params = [pacienteTratamiento.idpaciente, pacienteTratamiento.idtratamiento, pacienteTratamiento.idmedico, pacienteTratamiento.fecha_inicio, pacienteTratamiento.fecha_fin,pacienteTratamiento.estado, id];
        this.db.run(query, params, function (err) {
            if (err) console.log(err.message);
            else console.log("Registro paciente_tratamiento actualizado con éxito");
        });
    }

    deletePacienteTratamiento(id) {
        const query = 'DELETE FROM paciente_tratamiento WHERE id = ?';
        this.db.run(query, id, (err) => {
            if (err) {
                console.log(err.message);
            } else {
                console.log("Registro paciente_tratamiento eliminado con éxito");
                // Puedes agregar la lógica adicional si es necesario
            }
        });
    }

    // Función para reorganizar los IDs después de eliminar un usuario
    reorganizarIDs() {
        const query = 'UPDATE sqlite_sequence SET seq = (SELECT MAX(id) FROM usuario) WHERE name = "usuario"';
        this.db.run(query, [], function (err) {
            if (err) {
                console.log(err.message);
            } else {
                console.log("IDs reorganizados con éxito");
            }
        });
    }

    //Limpiar una tabla
    clearTable(tableName) {
        const queryDelete = `DELETE FROM ${tableName}`;
        const queryVacuum = 'VACUUM';

        this.db.run(queryDelete, (err) => {
            if (err) {
                console.error(`Error al limpiar la tabla ${tableName}:`, err.message);
            } else {
                console.log(`Tabla ${tableName} limpiada con éxito`);

                // Reiniciar el ID autoincrementado utilizando VACUUM
                this.db.run(queryVacuum, (errVacuum) => {
                    if (errVacuum) {
                        console.error('Error al reiniciar el ID autoincrementado:', errVacuum.message);
                    } else {
                        console.log('ID autoincrementado reiniciado con éxito');
                    }
                });
            }
        });
    }

    //recuperar el id del usuario
    getLastInsertedUserID() {
        const query = 'SELECT last_insert_rowid() as id';
        return new Promise((resolve, reject) => {
            this.db.get(query, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row.id);
                }
            });
        });
    }

    //eliminar tabla
    deleteTable(nombreTabla) {
        const query = `DROP TABLE IF EXISTS ${nombreTabla}`;
        this.db.run(query, [], (err) => {
            if (err) {
                console.error(`Error al eliminar la tabla ${nombreTabla}:`, err.message);
            } else {
                console.log(`Tabla ${nombreTabla} eliminada con éxito`);
            }
        });
    }
}

module.exports = Database;
