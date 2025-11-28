const express = require('express');
const router = express.Router();
const RolesController = require('../controllers/RolesController');

// GET - Obtener todos los roles
router.get('/', RolesController.obtenerTodosLosRoles);

// GET - Obtener roles con estadísticas (conteo de usuarios)
router.get('/estadisticas', RolesController.obtenerRolesConEstadisticas);

// GET - Obtener roles disponibles
router.get('/disponibles', RolesController.obtenerRolesDisponibles);

// GET - Obtener rol por ID
router.get('/:id', RolesController.obtenerRolPorId);

// GET - Obtener rol por nombre
router.get('/nombre/:nombre', RolesController.obtenerRolPorNombre);

// GET - Verificar si un rol está siendo usado
router.get('/:id/verificar-uso', RolesController.verificarUsoRol);

// POST - Crear nuevo rol
router.post('/', RolesController.crearRol);

// PUT - Actualizar rol
router.put('/:id', RolesController.actualizarRol);

// DELETE - Eliminar rol
router.delete('/:id', RolesController.eliminarRol);

module.exports = router;