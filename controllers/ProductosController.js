const ProductosService = require('../services/ProductosService');

class ProductosController {
    static async crearProducto(req, res) {
        try {
            const data = req.body;
            const nuevoProducto = await ProductosService.crearProducto(data);

            res.status(201).json({
                success: true,
                message: 'Producto creado exitosamente',
                data: nuevoProducto
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    static async buscarProductos(req, res) {
        try {
            const { q } = req.query;
            const producto = await ProductosService.buscarProductos(q);
            res.status(200).json({
                success: true,
                data: producto
            });
        } catch (error) {
            if (error.message.includes('requerido')) {
                res.status(400).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: error.message || 'Error al buscar productos'
                });
            }
        }
    }
    static async obtenerTodosLosProductos(req, res) {
        try {
            const productos = await ProductosService.obtenerTodosLosProductos();

            res.status(200).json({
                success: true,
                data: productos
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async obtenerProductosActivos(req, res) {
        try {
            const productos = await ProductosService.obtenerProductosActivos();

            res.status(200).json({
                success: true,
                data: productos
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async obtenerProductoPorId(req, res) {
        try {
            const { id } = req.params;
            const producto = await ProductosService.obtenerProductoPorId(id);

            res.status(200).json({
                success: true,
                data: producto
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async obtenerProductosPorCategoria(req, res) {
        try {
            const { categoria_id } = req.params;
            const productos = await ProductosService.obtenerProductosPorCategoria(categoria_id);

            res.status(200).json({
                success: true,
                data: productos
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    static async actualizarProducto(req, res) {
        try {
            const { id } = req.params;
            const productoData = req.body;

            const productoActualizado = await ProductosService.actualizarProducto(id, productoData);

            res.status(200).json({
                success: true,
                message: 'Producto actualizado exitosamente',
                data: productoActualizado
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    static async eliminarProducto(req, res) {
        try {
            const { id } = req.params;

            const resultado = await ProductosService.eliminarProducto(id);

            res.status(200).json({
                success: true,
                message: resultado.mensaje
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

static async obtenerProductosConImagenes(req, res) {
    try {
        const busqueda = (req.query.busqueda || '').toString().trim();
        const categoria_id = parseInt(req.query.categoria_id) || 0; 
        
        const productos = await ProductosService.obtenerProductosConImagenes(busqueda, categoria_id);
        
        res.status(200).json({
            success: true,
            data: productos
        });
    } catch (error) {
        console.error("Error al obtener productos:", error.message);
        res.status(500).json({
            success: false,
            message: `Error al obtener productos: ${error.message}`
        });
    }
}

    // Agregar este método al final de la clase ProductosController en backend/controllers/ProductosController.js

    static async obtenerProductosDestacados(req, res) {
        try {
            const limite = parseInt(req.query.limite) || 6;
            const productos = await ProductosService.obtenerProductosDestacados(limite);

            res.status(200).json({
                success: true,
                data: productos,
                count: productos.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = ProductosController;
