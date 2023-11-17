const express = require("express");
const router = express.Router();

const ControlUsuario = require("./controllers/controlUsuario.js");
const Usuario = require("./models/usuario.js");
const ctrlUsuario = new ControlUsuario();
//ctrlUsuario.cargarUsuarios();
/*router.get('/', async (req, res) => {
    const results = await ctrlUsuario.getAllUsuarios();
    res.render("index", { lista: results });
});*/

router.get('/login', async (req, res)=>{
        res.render("login");
});

router.get('/', async (req, res) => {
    try {
      const results = await ctrlUsuario.getAllUsuarios();
      res.render("index", { lista: results });
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
    } else {
        await ctrlUsuario.modificarUsuario(id, usuario);
    }

    const results = await ctrlUsuario.getAllUsuarios();
    res.render("index", { lista: results });
});

router.get('/usuarios/delete/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await ctrlUsuario.eliminarUsuario(id);
        const results = await ctrlUsuario.getAllUsuarios();
        res.render("index", { lista: results });
    } catch (error) {
        console.error(error);
        res.render("error"); // Renderizar una vista de error si algo sale mal
    }
});

module.exports = router;

//await y async en las rutas que esperan resultados