const { json } = require("body-parser");
const express = require("express");
const session = require('express-session');
const app = express();

app.use(session({
    secret: 'K1en54b5', 
    resave: false,
    saveUninitialized: true
}));

//invocar al motor de plantilas
app.set('view engine', 'ejs');

// Configuración para servir archivos estáticos desde el directorio 'public'
app.use(express.static('public'));

//leer formulario
app.use(express.urlencoded({extended:false}));
app.use(express(json));

app.use('/', require('./router'));

app.listen(5000, () => {
    console.log("Servidor escuchando en http://localhost:5000");
});

