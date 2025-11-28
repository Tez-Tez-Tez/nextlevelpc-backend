const ImagenProductoService = require('../services/ImagenProductoService');

class ImagenProductoController {
    static async crear(req, res) {
        try {
            const data = req.body;
            const imagenId = await ImagenProductoService.crearImagen(data);
            
            res.status(201).json({
                mensaje: 'Imagen creada exitosamente',
                imagen_id: imagenId
            });
        } catch (error) {
            console.error("Error en crear:", error);
            res.status(500).json({ mensaje: 'Error al crear la imagen: ' + error.message });
        }
    }

    static async obtenerPorProducto(req, res) {
        try {
            const producto_id = req.params.producto_id;
            const imagenes = await ImagenProductoService.obtenerImagenesPorProducto(producto_id);
            
            res.status(200).json(imagenes);
        } catch (error) {
            console.error("Error en obtenerPorProducto:", error);
            res.status(500).json({ mensaje: 'Error al obtener las imágenes: ' + error.message });
        }
    }

    static async obtenerPrincipal(req, res) {
        try {
            const producto_id = req.params.producto_id;
            const imagenPrincipal = await ImagenProductoService.obtenerImagenPrincipal(producto_id);
            
            if (!imagenPrincipal) {
                return res.status(404).json({ mensaje: 'No se encontró imagen principal para este producto' });
            }
            
            res.status(200).json(imagenPrincipal);
        } catch (error) {
            console.error("Error en obtenerPrincipal:", error);
            res.status(500).json({ mensaje: 'Error al obtener imagen principal: ' + error.message });
        }
    }

    static async eliminar(req, res) {
        try {
            const id = req.params.id;
            const resultado = await ImagenProductoService.eliminarImagen(id);
            
            res.status(200).json({
                mensaje: resultado.mensaje
            });
        } catch (error) {
            console.error("Error en eliminar:", error);
            if (error.message === 'Imagen no encontrada') {
                return res.status(404).json({ mensaje: error.message });
            }
            res.status(500).json({ mensaje: 'Error al eliminar la imagen: ' + error.message });
        }
    }

    static async establecerPrincipal(req, res) {
        try {
            const { producto_id, imagen_id } = req.body;
            const resultado = await ImagenProductoService.establecerImagenPrincipal(producto_id, imagen_id);
            
            res.status(200).json({
                mensaje: resultado.mensaje
            });
        } catch (error) {
            console.error("Error en establecerPrincipal:", error);
            res.status(500).json({ mensaje: 'Error al establecer imagen principal: ' + error.message });
        }
    }
}

module.exports = ImagenProductoController;