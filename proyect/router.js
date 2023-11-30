const express = require("express");
const router = express.Router();

const ControlUsuario = require("./controllers/controlUsuario.js");
const Usuario = require("./models/usuario.js");
const Medico = require('./models/medico.js');
const Paciente = require('./models/paciente.js');
const Tratamiento = require('./models/tratamiento.js');
const PacienteTratamiento = require('./models/pacienteTratamiento.js');
const ctrlUsuario = new ControlUsuario();
//ctrlUsuario.eliminarPaciente(2);
//ctrlUsuario.cargarUsuarios();
//ctrlUsuario.limpiarTabla('medicos');
//ctrlUsuario.limpiarTabla('pacientes');

/*ctrlUsuario.eliminarTabla('paciente_tratamiento');
ctrlUsuario.eliminarTabla('medicos');
ctrlUsuario.eliminarTabla('pacientes');
ctrlUsuario.eliminarTabla('tratamientos');*/

//const estampa = new Date();
//const admin=new Usuario(1,'admin.png','Cristhian','kiensab5','12345','seguraibarracristhian@gmail.com','admin',estampa);
//ctrlUsuario.adicionarUsuario(admin);
/*router.get('/lista',async (req, res) => {
    const results = await ctrlUsuario.getAllUsuarios();
    const medicos = await ctrlUsuario.getAllMedicos();
    const pacientes = await ctrlUsuario.getAllPacientes();
    res.render('admin_dashboard', { usuario: req.session.usuario, lista: results, medicos: medicos, pacientes: pacientes });
});*/

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
                res.redirect('/');
            }
        } else {
            // Credenciales inválidas, renderizar la página de inicio de sesión con un mensaje de error
            res.redirect('/');
            console.log("datos incorrectos");
        }
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.redirect('/');
    }
});
//cerrar sesion
router.get('/usuarios/logout', async (req, res) => {
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
            const medicos = await ctrlUsuario.getAllMedicos();
            const pacientes = await ctrlUsuario.getAllPacientes();
            res.render('admin_dashboard', { usuario: req.session.usuario, lista: results, medicos: medicos, pacientes: pacientes });
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
        res.status(500).send('Error');
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

//CRUD USUARIOS
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
    const fotografia_path = req.body.fotografia_path;
    const nombre = req.body.nombre;
    const apellidos = req.body.apellidos;
    const cuenta = req.body.cuenta;
    const clave = req.body.clave;
    const email = req.body.email;
    const rol = req.body.rol;
    const estampa = new Date();

    // Adicionar usuarios
    if (id == undefined || id == 0 || id == "0") {
        // Añadir el usuario sin proporcionar el ID
        const usuario = new Usuario(0, fotografia_path, nombre, cuenta, clave, email, rol, estampa);
        await ctrlUsuario.adicionarUsuario(usuario);

        // Recuperar el último ID insertado
        const UserID = await ctrlUsuario.getUserInsertID();

        // Añadir el médico o paciente con el ID del usuario
        if (rol == 'medico') {
            const especialidad = req.body.especialidad;
            const medico = new Medico(0, UserID, nombre, apellidos, especialidad);
            await ctrlUsuario.adicionarMedico(medico);
        } else if (rol == 'paciente') {
            const fecha_nacimiento = req.body.fecha_nacimiento;
            const sexo = req.body.sexo;
            const telefono = req.body.telefono;
            const paciente = new Paciente(0, UserID, nombre, apellidos, fecha_nacimiento, sexo, telefono);
            await ctrlUsuario.adicionarPaciente(paciente);
        }

        res.redirect('/');
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
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error');
    }
});
//CRUD tratamientos
router.get('/tratamientos/create', (req, res) => {
    res.render("create_tratamiento");
});

router.post('/tratamientos/save', async (req, res) => {
    const id = req.body.id;
    const nombre = req.body.nombre;
    const descripcion = req.body.descripcion;
    const observaciones = req.body.observaciones;
    const tratamiento = new Tratamiento(id, nombre, descripcion, observaciones);
    // Adicionar usuarios
    if (id == undefined || id == 0 || id == "0") {
        await ctrlUsuario.adicionarTratamiento(tratamiento);
        res.redirect('/medic/dashboard');
    } else {
        await ctrlUsuario.modificarTratamiento(id, tratamiento);
        res.redirect('/tratamientos/read');
    }
});

router.get('/tratamientos/edit/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const tratamiento = await ctrlUsuario.getByIdTratamiento(id);
        res.render("edit_tratamiento", { tratamiento: tratamiento });
    }catch(error){
        console.error(error);
        res.status(500).send('Error');
    }
    
});

router.get('/tratamientos/delete/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await ctrlUsuario.eliminarTratamiento(id);
        res.redirect('/tratamientos/read');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error');
    }
});

router.get('/tratamientos/read', async (req, res) => {
    try {
        const tratamientos = await ctrlUsuario.getAllTratamientos();
        res.render('read_tratamientos', { tratamientos: tratamientos });
    } catch (error) {
        // Manejar el error adecuadamente
        console.error(error);
        res.status(500).send('Error');
    }
});

//CRUD PACIENTES
router.get('/pacientes/read/:id', async (req, res) => {
    const id=req.params.id;
    try {
        const medico=await ctrlUsuario.getMedico(id);
        const pacientes = await ctrlUsuario.getAllPacientes();
        const usuarios = await ctrlUsuario.getAllUsuarios();
        res.render('read_pacientes', { pacientes: pacientes, users: usuarios,medico:medico });
    } catch (error) {
        console.error('Error al obtener pacientes:', error);
        res.status(500).send('Error al obtener pacientes');
    }
});
module.exports = router;
//asignar tratamiento 
router.get('/paciente/tratamiento/create/:id/:idmedico', async (req, res) => {
    const idpaciente= req.params.id;
    const idmedico=req.params.idmedico;
    try {
        //id, idpaciente, idtratamiento,idmedico , fecha_inicio, fecha_fin,estado
        const paciente = await ctrlUsuario.getByIdPaciente(idpaciente);
        const medico= await ctrlUsuario.getByIdMedico(idmedico);
        //const medicos = await ctrlUsuario.getAllMedicos();
        const tratamientos = await ctrlUsuario.getAllTratamientos();
        res.render('create_pacienteTratamiento', { paciente: paciente, medico: medico, tratamientos: tratamientos });
    } catch (error) {
        console.error('Error al redirigir: ', error);
        res.status(500).send('Error al redirigir');
    }
});
router.post('/paciente/tratamiento/save', async(req,res)=>{
    //id, idpaciente, idtratamiento,idmedico, fecha_inicio, fecha_fin,estado
    const id = req.body.id;
    const idpaciente = req.body.idpaciente;
    const idtratamiento = req.body.idtratamiento;
    const idmedico = req.body.idmedico;
    const fecha_inicio=req.body.fecha_inicio;
    const fecha_fin=req.body.fecha_fin;
    const estado=req.body.estado;
    const pacienteTratamiento = new PacienteTratamiento(id, idpaciente, idtratamiento, idmedico,fecha_inicio,fecha_fin,estado);
    const medico= await ctrlUsuario.getByIdMedico(idmedico);
    // asignar paciente tratamiento
    if (id == undefined || id == 0 || id == "0") {
        await ctrlUsuario.adicionarPacienteTratamiento(pacienteTratamiento);
        res.redirect('/pacientes/read/'+medico.idusuario);
    } else {
        await ctrlUsuario.modificarPacienteTratamiento(id, pacienteTratamiento);
        res.redirect('/paciente/tratamiento/read/'+idpaciente+'/'+medico.id);
    }
});
//ver tratamientos asignados
router.get('/paciente/tratamiento/read/:id/:idmedico', async (req,res)=>{
    const idpaciente = req.params.id;
    const idmedico =req.params.idmedico;
    try{
        const tratamientosAsignados= await ctrlUsuario.getAllTratamientosAsignados(idpaciente);
        const paciente=await ctrlUsuario.getByIdPaciente(idpaciente);
        const tratamientos=await ctrlUsuario.getAllTratamientos();
        const medicos=await ctrlUsuario.getAllMedicos();
        const medico=await ctrlUsuario.getByIdMedico(idmedico);
        res.render('read_pacienteTratamiento',{medico:medico,tratamientosAsignados:tratamientosAsignados,paciente:paciente,tratamientos:tratamientos,medicos:medicos});
    }catch (error) {
        console.error('No existen tratamientos asociados: ', error);
        res.status(500).send('No existen tratamientos asociados');
    }
});
//eliminar tratamientosAsignados
router.get('/paciente/tratamiento/delete/:id/:idpaciente/:idmedico', async (req, res) => {
    const id = req.params.id;
    const idpaciente=req.params.idpaciente;
    const idmedico=req.params.idmedico;
    try {
        await ctrlUsuario.eliminarPacienteTratamiento(id);
        res.redirect('/paciente/tratamiento/read/'+idpaciente+'/'+idmedico);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error');
    }
});
//edit
router.get('/paciente/tratamiento/edit/:id/:idpaciente/:idmedico', async (req, res) => {
    const id = req.params.id;
    const idpaciente=req.params.idpaciente;
    const idmedico=req.params.idmedico;
    try {
        const tratamientoAsignado= await ctrlUsuario.getByIdPacienteTratamiento(id);
        const paciente= await ctrlUsuario.getByIdPaciente(idpaciente);
        const tratamientos = await ctrlUsuario.getAllTratamientos();
        const medico=await ctrlUsuario.getByIdMedico(idmedico);
        res.render("edit_pacienteTratamiento", { tratamientoAsignado: tratamientoAsignado,paciente:paciente,tratamientos:tratamientos,medico:medico });
    }catch(error){
        console.error(error);
        res.status(500).send('Error al editar paciente tratamiento');
    }
});
// Visualizar tratamiento del paciente
router.get('/paciente/tratamientoAsignado/read/:id', async (req,res)=>{
    const id=req.params.id;
    try{
        const paciente=await ctrlUsuario.getPaciente(id);
        const tratamientosAsignados=await ctrlUsuario.getAllTratamientosAsignados(paciente.id);
        const tratamientos=await ctrlUsuario.getAllTratamientos();
        const medicos=await ctrlUsuario.getAllMedicos();
        res.render('read_tratamientosAsignados',{paciente:paciente,tratamientos:tratamientos,tratamientosAsignados:tratamientosAsignados,medicos:medicos});
    }catch(error){
        console.error(error);
        res.status(500).send('No existen tratamientos asignados');
    }
});

//await y async en las rutas que esperan resultados