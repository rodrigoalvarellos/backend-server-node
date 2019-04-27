// Requires, librerias a utilizar
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');



// Inicializar variables
var app = express();

//BodyParse - parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
// usa el mismo express para lo mismo
// app.use(express.json());

// Conexion a BD
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', {
        useCreateIndex: true,
        useNewUrlParser: true
    })
    .then(() => {
        console.log("Base de datos: \x1b[32m%s\x1b[0m", " online");
    })
    .catch((err) => {
        console.error(err);
    });

// Importar Rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');


// Rutas 
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);



// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express Server corriendo en puerto 3000: \x1b[32m%s\x1b[0m', 'ONLINE');
});

// para probar