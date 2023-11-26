class Usuario {
    constructor(id,fotografia_path,nombre, cuenta, clave, email, rol,estampa) {

        this.id = id;
        this.fotografia_path=fotografia_path;
        this.nombre = nombre;
        this.cuenta = cuenta;
        this.clave = clave;
        this.email = email;
        this.rol = rol;
        this.estampa=estampa;
    }
    toString() {
        return this.nombre;
    }
    getRol() {
        return this.rol;
    }
    getCuenta() {
        return this.cuenta;
    }
    getEmail() {
        return this.email;
    }
    claveValida(clave) {
        if (this.clave === clave) {
            return true;
        } else {
            return false;
        }
    }
}
module.exports=Usuario;