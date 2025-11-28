const express = require('express');
const router = express.Router();
const citaServicioController = require('../controllers/CitaServicioController');
const viewAuth = require('../middlewares/viewAuth');

// Cualquier cliente puede crear una cita
router.post('/', citaServicioController.create);

// Solo admin y empleado pueden ver las citas
router.get('/', viewAuth(['admin', 'empleado']), citaServicioController.getAll);
router.patch('/:id',viewAuth(['admin', 'empleado']), citaServicioController.actualizar)
router.patch('/:id/estado', viewAuth(['admin', 'empleado']), citaServicioController.updateStatus);
router.delete('/:id', viewAuth(['admin', 'empleado']), citaServicioController.deleteCita);

module.exports = router;
