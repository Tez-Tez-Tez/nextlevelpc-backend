const express = require('express');
const UsuariosController = require('../controllers/UsuariosController.js');
const viewAuth = require('../middlewares/viewAuth.js');

const router = express.Router();

// Rutas públicas
router.post('/', UsuariosController.crear);
router.post('/registro', UsuariosController.crear); 
router.post('/login', UsuariosController.login);
router.post('/refresh', UsuariosController.refresh);
router.post('/logout', UsuariosController.logout);
router.patch('/:id',viewAuth([]),UsuariosController.actualizar);

// Rutas protegidas
router.get('/', viewAuth(['admin']), UsuariosController.obtenerTodos);
router.delete('/:id', viewAuth(['admin']), UsuariosController.eliminar);
router.get('/:id', viewAuth(['admin', 'empleado']), UsuariosController.obtenerPorId);

module.exports = router;
