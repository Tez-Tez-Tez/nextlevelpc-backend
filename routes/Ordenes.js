const express = require('express');
const OrdenesController = require('../controllers/OrdenesController.js');
const viewAuth = require('../middlewares/viewAuth.js');

const router = express.Router();

router.get('/', viewAuth(['admin', 'empleado']), OrdenesController.obtenerTodos);
router.post('/', viewAuth(['admin', 'empleado', 'cliente']), OrdenesController.crear);
router.delete('/:id', viewAuth(['admin']), OrdenesController.eliminar);
router.patch('/:id', viewAuth(['admin', 'empleado']), OrdenesController.actualizar);
// Temporal: sin autenticación para ver facturas después del pago
router.get('/:id', OrdenesController.obtenerPorId);
router.get('/cliente/:clienteId', viewAuth(['admin', 'empleado', 'cliente']), OrdenesController.obtenerPorCliente);
router.get('/numero/:numeroOrden', viewAuth(['admin', 'empleado', 'cliente']), OrdenesController.obtenerPorNumeroOrden);

module.exports = router;