var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

// Google
const CLIENT_ID = require('../config/config').CLIENT_ID;
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

var SEED = require('../config/config').SEED;

var app = express();
var Usuario = require('../models/usuario');

// =========================================
// Autenticacion Normal
// =========================================

app.post('/', (req, res) => {

  var body = req.body;

  Usuario.findOne({
    email: body.email
  }, (err, usuarioBD) => {

    if (err) {
      return res.status(500).json({

        ok: false,
        mensaje: 'Error al logearse',
        error: err
      });
    }

    if (!usuarioBD) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Credenciales incorrectas - email'
      });
    }

    if (!bcrypt.compareSync(body.password, usuarioBD.password)) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Credenciales incorrectas - password'
      });
    }


    // Crear un Token !!!
    usuarioBD.password = ':)';
    var token = jwt.sign({
        usuario: usuarioBD
      },
      SEED, {
        expiresIn: 14400
      }
    );

    res.status(200).json({

      ok: true,
      mensaje: 'Login post correcto',
      usuarioBD: usuarioBD,
      token: token,
      id: usuarioBD._id

    });

  });

});

// =========================================
// Autenticacion Google
// =========================================

async function verify( token ) {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  // const userid = payload['sub'];
  // If request specified a G Suite domain:
  // const domain = payload['hd'];

  return {
    nombre: payload.name,
    email: payload.email,
    img: payload.picture,
    google: true
  };
}

app.post('/google', async (req, res) => {

  var token = req.body.token;

  var googleUser = await verify(token)
    .catch(e => {

      return res.status(403).json({
        ok: false,
        mensaje: 'Token no valido'
      });

    });
  
  Usuario.findOne({ email: googleUser.email }, (err, usuarioBD) => {

    if (err) {
      return res.status(500).json({

        ok: false,
        mensaje: 'Error al logearse',
        error: err
      });
    }

    if (usuarioBD) {
     
      if (usuarioBD.google === false) {

        return res.status(400).json({

          ok: false,
          mensaje: 'Debe usar la autenticacion normal',
          error: err
        });

      } else {

        usuarioBD.password = ':)';
        var token = jwt.sign( { usuario: usuarioBD }, SEED, { expiresIn: 14400 });
    
        res.status(200).json({
    
          ok: true,
          mensaje: 'Login post correcto',
          usuarioBD: usuarioBD,
          token: token,
          id: usuarioBD._id
    
        });

      }

    } else {
        // El usuario no existe, hay que crearlo
      
      var usuario = new Usuario();

      usuario.nombre = googleUser.nombre;
      usuario.email = googleUser.email;
      usuario.img = googleUser.img;
      usuario.google = true;
      usuario.password = ':)';

      usuario.save((err, usuarioBD) => {

        var token = jwt.sign( { usuario: usuarioBD }, SEED, { expiresIn: 14400 });
    
        res.status(200).json({
    
          ok: true,
          mensaje: 'Login post correcto',
          usuarioBD: usuarioBD,
          token: token,
          id: usuarioBD._id
    
        });

      });


    }



  });

  // return res.status(200).json({
  //   ok: true,
  //   mensaje: 'Autenticacion por Google correcta',
  //   googleUser: googleUser
    
  // });

});

module.exports = app;
