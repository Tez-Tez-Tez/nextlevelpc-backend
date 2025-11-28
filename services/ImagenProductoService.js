const ImagenProducto = require('../models/ImagenProducto');

class ImagenProductoService {
    static async crearImagen(datosImagen) {
        try {
            // Validar campos requeridos
            if (!datosImagen.producto_id || !datosImagen.url) {
                throw new Error('Producto ID y URL son requeridos');
            }

            return await ImagenProducto.crear(datosImagen);
        } catch (error) {
            throw new Error('Error al crear la imagen: ' + error.message);
        }
    }

    static async obtenerImagenesPorProducto(producto_id) {
        try {
            if (!producto_id) {
                throw new Error('Producto ID es requerido');
            }

            return await ImagenProducto.obtenerPorProducto(producto_id);
        } catch (error) {
            throw new Error('Error al obtener imágenes del producto: ' + error.message);
        }
    }

    static async obtenerImagenPrincipal(producto_id) {
        try {
            if (!producto_id) {
                throw new Error('Producto ID es requerido');
            }

            return await ImagenProducto.obtenerPrincipal(producto_id);
        } catch (error) {
            throw new Error('Error al obtener imagen principal: ' + error.message);
        }
    }

    static async eliminarImagen(id) {
        try {
            if (!id) {
                throw new Error('ID de imagen es requerido');
            }

            const eliminado = await ImagenProducto.eliminar(id);
            
            if (!eliminado) {
                throw new Error('Imagen no encontrada');
            }

            return { mensaje: 'Imagen eliminada correctamente' };
        } catch (error) {
            throw new Error('Error al eliminar imagen: ' + error.message);
        }
    }

    static async establecerImagenPrincipal(producto_id, imagen_id) {
        try {
            if (!producto_id || !imagen_id) {
                throw new Error('Producto ID e Imagen ID son requeridos');
            }

            const actualizado = await ImagenProducto.establecerPrincipal(producto_id, imagen_id);
            
            if (!actualizado) {
                throw new Error('No se pudo establecer como imagen principal');
            }

            return { mensaje: 'Imagen principal establecida correctamente' };
        } catch (error) {
            throw new Error('Error al establecer imagen principal: ' + error.message);
        }
    }

    static async obtenerPorId(id) {
        try {
            if (!id) {
                throw new Error('ID de imagen es requerido');
            }
            return await ImagenProducto.obtenerPorId(id);

        } catch (error) {
            throw new Error('Error al obtener imagen por ID: ' + error.message);
        }
    }
}

module.exports = ImagenProductoService;