var express = require('express');
var fileUpload = require('express-fileupload'); // libreria express Fileupload
var fs = require('fs');

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');


var app = express();



app.use(fileUpload());


app.put('/:tipo/:id', (req, res, next) => {

  var tipo = req.params.tipo;
  var id = req.params.id;

  // Tipos de colecciones 
  var tiposValidos = ['usuarios', 'medicos', 'hospitales'];

  if (tiposValidos.indexOf(tipo) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Tipo de coleccion no valida',
      errors: {
        message: 'Tipo de coleccion no valida'
      }
    });
  }


  // Valido si viene un archivo
  if (!req.files) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Error seleccionó ninguna Imagen',
      errors: {
        message: 'Debe seleccionar una imagen'
      }
    });
  }

  // Obtener nombre del archivo
  var archivo = req.files.imagen;
  var nombreCortado = archivo.name.split('.');
  var extensionArchivo = nombreCortado[nombreCortado.length - 1];

  // Solo estas extensiones aceptadas
  var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

  if (extensionesValidas.indexOf(extensionArchivo) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Extension no válida',
      errors: {
        message: 'Las extensiones validas son : ' + extensionesValidas.join(', ')
      }
    });
  }

  // Nombre de archivo personalizado 'idUsuario-nroRandom.ext'
  var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

  // Mover el archivo del path temporal a una carpeta

  var path = `./uploads/${tipo}/${nombreArchivo}`;

  archivo.mv(path, err => {

    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al mover el archivo',
        errors: {
          message: 'Error al mover el archivo'
        }
      });
    }

    subirPorTipo(tipo, id, nombreArchivo, res);

    // res.status(200).json({
    //   ok: true,
    //   mensaje: 'Archivo movido'
    // });


  });

});

function subirPorTipo(tipo, id, nombreArchivo, res) {

  if (tipo === 'usuarios') {

    Usuario.findById(id, (err, usuario) => {

      if (err) {
        return res.status(404).json({
          ok: false,
          mensaje: 'El usuario no existe'
        });
      }

      if (!usuario) {
        return res.status(400).json({
          ok: false,
          mensaje: 'El usuario no existe'
        });
      }

      var pathViejo = "../uploads/usuarios/" + usuario.img;

      // Si existe, elimina la imagen anterior
      if (fs.existsSync(pathViejo)) {
        fs.unlink(pathViejo);
      }

      usuario.img = nombreArchivo;
      usuario.save((err, usuarioActualizado) => {

        if (err) {

          return res.status(400).json({
            ok: false,
            mensaje: 'Error al actualizar la imagen'
          });

        }

        usuarioActualizado.password = ':)';

        return res.status(200).json({
          ok: true,
          mensaje: 'Imagen de usuario actualizada',
          usuario: usuarioActualizado
        });

      });

    });

    return;
  }

  if (tipo === 'medicos') {

    Medico.findById(id, (err, medico) => {

      if (err) {
        return res.status(404).json({
          ok: false,
          mensaje: 'El Medico no existe'
        });
      }

      if (!medico) {
        return res.status(400).json({
          ok: false,
          mensaje: 'El medico no existe'
        });
      }

      var pathViejo = "../uploads/medicos/" + medico.img;

      // Si existe, elimina la imagen anterior
      if (fs.existsSync(pathViejo)) {
        fs.unlink(pathViejo);
      }

      medico.img = nombreArchivo;
      medico.save((err, medicoActualizado) => {

        if (err) {

          return res.status(404).json({
            ok: false,
            mensaje: 'Error al actualizar la imagen'
          });

        }

        return res.status(200).json({
          ok: true,
          mensaje: 'Imagen del medico actualizada',
          medico: medicoActualizado
        });

      });

    });

    return;
  }

  if (tipo === 'hospitales') {
    
    Hospital.findById(id, (err, hospital) => {

      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'El hospital no existe'
        });
      }

      if (!hospital) {
        return res.status(400).json({
          ok: false,
          mensaje: 'El hospital no existe'
        });
      }

      var pathViejo = "../uploads/hospitales/" + hospital.img;

      // Si existe, elimina la imagen anterior
      if (fs.existsSync(pathViejo)) {
        fs.unlink(pathViejo);
      }

      hospital.img = nombreArchivo;
      hospital.save((err, hospitalActualizado) => {

        if (err) {

          return res.status(400).json({
            ok: false,
            mensaje: 'Error al actualizar la imagen'
          });

        }

        return res.status(200).json({
          ok: true,
          mensaje: 'Imagen del hospital actualizada',
          hospital: hospitalActualizado
        });

      });

    });

    return;
  }

}

module.exports = app;
