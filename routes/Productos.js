const express = require('express');
const router = express.Router();
const ProductosController = require('../controllers/ProductosController.js');
const viewAuth = require('../middlewares/viewAuth.js');
const { productosConImagenes } = require('../models/Productos.js');


// Rutas públicas
router.get('/', ProductosController.obtenerTodosLosProductos);
router.get('/destacados', ProductosController.obtenerProductosDestacados);
router.get('/con-imagenes', ProductosController.obtenerProductosConImagenes);
router.get('/activos', ProductosController.obtenerProductosActivos);
router.get('/buscar', ProductosController.buscarProductos);
router.get('/categoria/:categoria_id', ProductosController.obtenerProductosPorCategoria);
router.get('/search',ProductosController.obtenerProductosConImagenes);
router.get('/:id', ProductosController.obtenerProductoPorId);

// Rutas protegidas
router.post('/', viewAuth(['admin', 'empleado']), ProductosController.crearProducto);
router.patch('/:id', viewAuth(['admin', 'empleado']), ProductosController.actualizarProducto);
router.delete('/:id', viewAuth(['admin']), ProductosController.eliminarProducto);

module.exports = router;
