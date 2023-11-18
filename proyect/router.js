const express = require("express");
const router = express.Router();

const ControlUsuario = require("./controllers/controlUsuario.js");
const Usuario = require("./models/usuario.js");
const ctrlUsuario = new ControlUsuario();
//ctrlUsuario.cargarUsuarios();

router.get('/lista', async (req, res) => {
    const results = await ctrlUsuario.getAllUsuarios();
    res.render("admin_dashboard", { lista: results });
});

router.post('/usuarios/login', async (req, res) => {
    const cuenta = req.body.cuenta;
    const clave = req.body.clave;

    try {
        const usuario = await ctrlUsuario.accesoPermitido(cuenta, clave, req);

        if (usuario) {
            await ctrlUsuario.iniciarSesion(req, usuario);
            // Credenciales válidas, redirigir según el rol
            if (usuario.rol === 'admin') {
                res.redirect('/admin/dashboard');
            } else if (usuario.rol === 'paciente') {
                res.redirect('/paciente/dashboard');
            } else if (usuario.rol === 'medico') {
                // Manejar otros roles según sea necesario
                res.redirect('/medic/dashboard');
            } else {
                res.render("login", { error: 'Rol no reconocido' });
            }
        } else {
            // Credenciales inválidas, renderizar la página de inicio de sesión con un mensaje de error
            res.render("login", { error: 'Credenciales inválidas' });
        }
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.render("login", { error: 'Error al autenticar' });
    }
});
//cerrar sesion
router.post('/usuarios/logout', async (req, res) => {
    try {
        await ctrlUsuario.cerrarSesion(req);
        res.redirect('/'); // Puedes redirigir a la página principal u otra página después de cerrar sesión
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        res.redirect('/'); // En caso de error, redirigir a la página principal
    }
});

router.get('/admin/dashboard', async (req, res) => {
    // Verificar que el usuario tenga el rol de administrador antes de permitir el acceso
    if (req.session.usuario && req.session.usuario.rol === 'admin') {
        try {
            const results = await ctrlUsuario.getAllUsuarios();
            res.render('admin_dashboard', { usuario: req.session.usuario, lista: results });
        } catch (error) {
            // Manejar el error adecuadamente
            console.error('Error al obtener usuarios:', error);
            res.status(500).send('Error al obtener usuarios');
        }
    } else {
        // Redirigir a una página de error o a la página de inicio si el usuario no es un administrador
        res.redirect('/');
    }
});

router.get('/medic/dashboard', async (req, res) => {
    // Verificar que el usuario tenga el rol de administrador antes de permitir el acceso
    if (req.session.usuario && req.session.usuario.rol === 'medico') {
        try {
            res.render('medic_dashboard', { usuario: req.session.usuario });
        } catch (error) {
            // Manejar el error adecuadamente
            console.error('Error al autenticar', error);
            res.status(500).send('Error al autenticar');
        }
    } else {
        // Redirigir a una página de error o a la página de inicio si el usuario no es un administrador
        res.redirect('/');
    }
});

router.get('/paciente/dashboard', async (req, res) => {
    // Verificar que el usuario tenga el rol de administrador antes de permitir el acceso
    if (req.session.usuario && req.session.usuario.rol === 'paciente') {
        try {
            res.render('paciente_dashboard', { usuario: req.session.usuario });
        } catch (error) {
            // Manejar el error adecuadamente
            console.error('Error al autenticar', error);
            res.status(500).send('Error al autenticar');
        }
    } else {
        // Redirigir a una página de error o a la página de inicio si el usuario no es un administrador
        res.redirect('/');
    }
});


router.get('/', async (req, res) => {
    try {
        //const results = await ctrlUsuario.getAllUsuarios();
        //res.render("index", { lista: results });
        res.render("login");
    } catch (error) {
        console.error(error);
        res.render("error"); // Renderizar una vista de error si algo sale mal
    }
});

/*router.get('/usuarios', async (req, res) => {
    try {
        const results = await ctrlUsuario.getAllUsuarios();
        res.render("index", { lista: results });
    } catch (error) {
        console.error(error);
        res.render("error"); // Renderizar una vista de error si algo sale mal
    }
});*/

router.get('/usuarios/create', (req, res) => {
    res.render("create");
});

router.get('/usuarios/edit/:id', async (req, res) => {
    const id = req.params.id;
    const usuario = await ctrlUsuario.getById(id);
    res.render("edit", { user: usuario });
});

router.post('/usuarios/save', async (req, res) => {
    const id = req.body.id;
    const nombre = req.body.nombre;
    const cuenta = req.body.cuenta;
    const clave = req.body.clave;
    const email = req.body.email;
    const rol = req.body.rol;
    const estampa = new Date();
    const usuario = new Usuario(id, nombre, cuenta, clave, email, rol, estampa);

    if (id == undefined || id == 0 || id == "0") {
        await ctrlUsuario.adicionarUsuario(usuario);
        res.render("login");
    } else {
        await ctrlUsuario.modificarUsuario(id, usuario);
        const results = await ctrlUsuario.getAllUsuarios();
        res.render('admin_dashboard', { lista: results });
    }
});

router.get('/usuarios/delete/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await ctrlUsuario.eliminarUsuario(id);
        const results = await ctrlUsuario.getAllUsuarios();
        res.render("admin_dashboard", { lista: results });
    } catch (error) {
        console.error(error);
        res.render("error"); // Renderizar una vista de error si algo sale mal
    }
});

module.exports = router;

//await y async en las rutas que esperan resultados