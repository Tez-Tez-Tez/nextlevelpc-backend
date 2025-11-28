const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');
const viewAuth = require('../middlewares/viewAuth');

// GET /api/categorias - Obtener todas las categorías
router.get('/', categoriaController.getCategorias);

router.get('/producto', categoriaController.getCategoriasProductos);

// GET /api/categorias/:id - Obtener una categoría por ID
router.get('/:id', categoriaController.getCategoria);

// POST /api/categorias - Crear una nueva categoría
router.post('/', viewAuth(['admin']), categoriaController.createCategoria);

// PUT /api/categorias/:id - Actualizar una categoría
router.patch('/:id', viewAuth(['admin']), categoriaController.updateCategoria);

// DELETE /api/categorias/:id - Eliminar una categoría
router.delete('/:id', viewAuth(['admin']), categoriaController.deleteCategoria);

module.exports = router;