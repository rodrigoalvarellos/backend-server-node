var express = require('express');
var app = express();

var Hospital = require('../models/hospital');
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');



// =====================================
// Busqueda por Coleccion 
// =====================================

app.get('/coleccion/:tabla/:busqueda', (req, res) => {

  var tabla = req.params.tabla;
  var busqueda = req.params.busqueda;
  var regex = new RegExp(busqueda, 'i');

  var promesa;

  switch (tabla) {

    case 'usuarios':
      promesa = buscarUsuarios(regex);
      break;
    case 'medicos':
      promesa = buscarMedicos(regex);
      break;
    case 'hospitales':
      promesa = buscarHospitales(regex);
      break;
    default:      
      return res.status(400).json({
        ok: false,
        mensaje: 'Los tipos de busquedas solo son: usuarios, medicos y hospitales',
        err: { message: 'Tipo de tabla/coleccion no valido'}
      });
  }

  promesa.then(data => {
    
    res.status(200).json({
      ok: true,
      [tabla]: data
    });

  });



});


// =====================================
// Busqueda General 
// =====================================

app.get('/todo/:busqueda', (req, res, next) => {

  var busqueda = req.params.busqueda;
  var regex = new RegExp(busqueda, 'i');

  /*NOTA: los metodos de mongoose tambien son promesas por lo que no hace falta hacer una funcion como este ejemplo
  var medicoPromesa = Medico.find({nombre: regex});
  var hospitalPromesa = Hospital.find({nombre: regex});
  ...
  Promise.all([medicoPromesa,hospitalPromesa]).then(...).....
  */
  Promise.all([
      buscarHospitales(regex),
      buscarMedicos(regex),
      buscarUsuarios(regex)
    ])
    .then(respuestas => {

      res.status(200).json({
        ok: true,
        hospitales: respuestas[0],
        medicos: respuestas[1],
        usuarios: respuestas[2]
      });

    });

});

function buscarHospitales(regex) {

  return new Promise((resolve, reject) => {

    Hospital.find({
        nombre: regex
      })

      .populate('usuario', 'nombre email img')
      .exec((err, hospitales) => {

        if (err) {
          reject('Error al cargar Hospitales', err);
        } else {
          resolve(hospitales);
        }

      });

  });

}

function buscarMedicos(regex) {

  return new Promise((resolve, reject) => {

    Medico.find({
        nombre: regex
      })
      .populate('usaurio', 'nombre email img')
      .populate('hospital')
      .exec((err, medicos) => {

        if (err) {
          reject('Error al cargar Medicos');
        } else {
          resolve(medicos);
        }

      });

  });

}

function buscarUsuarios(regex) {
  return new Promise((resolve, reject) => {

    Usuario.find({}, 'nombre email role img')
      .or([{
        nombre: regex
      }, {
        email: regex
      }])
      .exec((err, usuarios) => {

        if (err) {
          reject('Error al cargar usuarios', err);
        } else {
          resolve(usuarios);
        }
      });

  });
}

module.exports = app;