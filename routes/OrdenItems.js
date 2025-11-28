const express = require('express');
const OrdenItemsController = require('../controllers/OrdenItemsController.js');
const viewAuth = require('../middlewares/viewAuth.js');

const router = express.Router();

router.get('/', viewAuth(['admin', 'empleado']), OrdenItemsController.obtenerTodos);
router.post('/', viewAuth(['admin', 'empleado', 'cliente']), OrdenItemsController.crear);
router.put('/:id', viewAuth(['admin', 'empleado']), OrdenItemsController.actualizar);
router.delete('/:id', viewAuth(['admin']), OrdenItemsController.eliminar);
router.get('/orden/:ordenId', viewAuth(['admin', 'empleado', 'cliente']), OrdenItemsController.obtenerPorOrden);

module.exports = router;