const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// Ruta para registrar un usuario (POST /api/usuarios)
router.post('/', usuarioController.crearUsuario);

// Ruta para ver todos los usuarios (GET /api/usuarios)
router.get('/', usuarioController.obtenerUsuarios);

module.exports = router;
