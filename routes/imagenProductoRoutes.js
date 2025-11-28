const express = require('express');
const router = express.Router();
const ImagenProductoController = require('../controllers/ImagenProductoController');
const viewAuth = require('../middlewares/viewAuth');

router.post('/', viewAuth(['admin', 'empleado']), ImagenProductoController.crear);
router.get('/producto/:producto_id', ImagenProductoController.obtenerPorProducto);
router.get('/principal/:producto_id', ImagenProductoController.obtenerPrincipal);
router.delete('/:id', viewAuth(['admin']), ImagenProductoController.eliminar);
router.patch('/establecer-principal', viewAuth(['admin', 'empleado']), ImagenProductoController.establecerPrincipal);

module.exports = router;