// Requires, librerias a utilizar
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');



// Inicializar variables
var app = express();

// configuracion de CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");

    next();
});

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
        console.log("Base de datos: \x1b[32m%s\x1b[0m", " ONLINE :)");
    })
    .catch((err) => {
        console.error(err);
    });

// Server Index Config, Sirve para desplegar un ruta /uploads que muestra un filesystem con las carpetas etc
// var serveIndex = require('serve-index');
// app.use(express.static(__dirname + '/'));
// app.use('/uploads', serveIndex(__dirname + '/uploads'));


// Importar Rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var hospitalRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var uploadRoutes = require('./routes/upload');
var loginRoutes = require('./routes/login');
var busquedaRoutes = require('./routes/busqueda');
var imagenesRoutes = require('./routes/imagenes');



// Rutas 
app.use('/usuario', usuarioRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes); // La ultima ruta siempre



// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express Server corriendo en puerto 3000: \x1b[32m%s\x1b[0m', 'ONLINE :)');
});

// para probar