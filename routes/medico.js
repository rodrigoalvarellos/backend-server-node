var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');

// =========================================
// Obtener todos los MEDICOS
// =========================================
app.get('/', (req, res, next) => {

  var desde = req.query.desde || 0;
  desde = Number(desde);

  Medico.find({})
    .skip(desde) //salta los xxx registros
    .limit(5) // Limita cierta cantidad de registros Mongose
    .populate('usuario', 'nombre email')
    .populate('hospital')
    .exec((err, medicos) => {

      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando medicos!',
          errors: err
        });
      }

      Medico.countDocuments({}, (err, conteo) => {

        res.status(200).json({
          ok: true,
          medicos: medicos,
          total: conteo
        });

      });

    });

});

// =========================================
// Obtener MEDICO por ID
// =========================================
app.get('/:id', (req, res) => {

  var id = req.params.id;

  Medico.findById(id)
    .populate('usaurio', 'nombre email img')
    .populate('hospital')
    .exec((err, medico) => {

      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al buscar medico',
          errors: err
        });
      }
  
      if (!medico) {
  
        return res.status(400).json({
          ok: false,
          mensaje: `El medico con el id ${id} no existe.`,
          errors: {
            message: 'No existe un medico con ese ID'
          }
        });
  
      }

      res.status(200).json({
        ok: true,
        medico: medico        
      });
      
    });


});


// =========================================
// Actualizar Medicos
// =========================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

  var id = req.params.id;
  var body = req.body;

  Medico.findById(id, (err, medico) => {

    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar medico',
        errors: err
      });
    }

    if (!medico) {

      return res.status(400).json({
        ok: false,
        mensaje: `El medico con el id ${id} no existe.`,
        errors: {
          message: 'No existe un medico con ese ID'
        }
      });

    }

    medico.nombre = body.nombre;
    medico.usuario = req.usuario._id;
    medico.hospital = body.hospital;

    medico.save((err, medicoGuardado) => {

      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar medico',
          errors: err
        });
      }

      res.status(201).json({
        ok: true,
        medico: medicoGuardado
      });

    });

  });

});


// =========================================
// Crear un nuevo Medico
// =========================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

  // Funciona por el bodyParser
  var body = req.body;

  var medico = new Medico({
    nombre: body.nombre,
    usuario: req.usuario._id,
    hospital: body.hospital // El id solo
  });

  medico.save((err, medicoGuardado) => {

    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al crear medico',
        errors: err
      });
    }

    res.status(201).json({
      ok: true,
      medico: medicoGuardado
    });

  });

});

// =========================================
// Eliminar Medico
// =========================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

  var id = req.params.id;

  Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al borrar medico',
        errors: err
      });
    }

    if (!medicoBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No existe un medico con ese ID',
        errors: {
          message: 'No existe un medico con ese ID'
        }
      });
    }

    res.status(200).json({
      ok: true,
      medico: medicoBorrado
    });

  });

});


module.exports = app;