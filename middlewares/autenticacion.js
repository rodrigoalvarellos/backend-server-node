var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

// =========================================
// Verificar Token
// =========================================
exports.verificaToken = function (req, res, next) {

  var token = req.query.token;

  jwt.verify(token, SEED, (err, decoded) => {

    if (err) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Token incorrecto',
        error: err
      });
    }

    req.usuario = decoded.usuario;
    next();

  });

};

// =========================================
// Verificar ADMIN
// =========================================
exports.verificaADMIN_ROLE = function (req, res, next) {

  var usuario = req.usuario;

  if (usuario.role === 'ADMIN_ROLE') {
    
    next();
    return;

  } else {

    return res.status(401).json({
      ok: false,
      mensaje: 'Usuario no tiene permisos suficientes',
      error: { message: 'No tiene los privilegios suficientes'}
    });

  } 

};

// =========================================
// Verificar ADMIN o Mismo usuario
// =========================================
exports.verificaADMIN_o_MismoUsuario = function (req, res, next) {

  var usuario = req.usuario;
  var id = req.params.id;

  if (usuario.role === 'ADMIN_ROLE' || usuario._id === id ) {
    
    next();
    return;

  } else {

    return res.status(401).json({
      ok: false,
      mensaje: 'Usuario no tiene permisos suficientes',
      error: { message: 'No tiene los privilegios suficientes'}
    });

  } 

};
