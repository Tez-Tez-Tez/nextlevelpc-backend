const Productos = require('../models/Productos');
const { CreateProductoDto, UpdateProductoDto } = require('../dto/ProductosDto');

class ProductosService {
    static async crearProducto(productoData) {
        try {
            const producto = new CreateProductoDto(productoData);
            const errors = producto.validate();
            if (errors.length > 0) {
                throw new Error('Erroes de validación: '+ errors.join(','));
            }

            const productoId = await Productos.crear(producto.toModel());
            return await Productos.obtenerPorId(productoId);
        } catch (error) {
            throw new Error(`Error al crear producto: ${error.message}`);
        }
    }

    static async obtenerTodosLosProductos() {
        try {
            return await Productos.obtenerTodos();
        } catch (error) {
            throw new Error(`Error al obtener productos: ${error.message}`);
        }
    }
    static async buscarProductos(query) {
        if (!query || query.trim() === '') {
            throw new Error("El termino de busqueda es requerido");
        }
        const productos = await Productos.buscarPorNombre(query);
        return productos;
    }


    static async obtenerTodos() {
        return await this.obtenerTodosLosProductos();
    }

    static async obtenerProductosActivos() {
        try {
            return await Productos.obtenerActivos();
        } catch (error) {
            throw new Error(`Error al obtener productos activos: ${error.message}`);
        }
    }

    static async obtenerProductoPorId(id) {
        try {
            if (!id) {
                throw new Error('ID de producto es requerido');
            }

            const producto = await Productos.obtenerPorId(id);

            if (!producto) {
                throw new Error('Producto no encontrado');
            }

            return producto;
        } catch (error) {
            throw new Error(`Error al obtener producto: ${error.message}`);
        }
    }

    static async obtenerProductosPorCategoria(categoria_id) {
        try {
            if (!categoria_id) {
                throw new Error('ID de categoría es requerido');
            }

            return await Productos.obtenerPorCategoria(categoria_id);
        } catch (error) {
            throw new Error(`Error al obtener productos por categoría: ${error.message}`);
        }
    }

    static async actualizarProducto(id, productoData) {
        try {
            const productoExistente = await Productos.obtenerPorId(id);
            if (!productoExistente) {
                throw new Error('Producto no encontrado');
            }

            const actualizar = new UpdateProductoDto(productoData);
            const errors = actualizar.validate();
            if(errors.length > 0){
                throw new Error('Errores de validación: '+errors.join(', '));
            }

            const campos = actualizar.toPatchObject();
            if(Object.keys(campos).length === 0) {throw new Error('No se enviaron campos')};

            const actualizado = await Productos.actualizar(id, campos);

            if (!actualizado) {
                throw new Error('No se pudo actualizar el producto');
            }

            return await Productos.obtenerPorId(id);
        } catch (error) {
            throw new Error(`Error al actualizar producto: ${error.message}`);
        }
    }

    static async eliminarProducto(id) {
        try {
            const productoExistente = await Productos.obtenerPorId(id);
            if (!productoExistente) {
                throw new Error('Producto no encontrado');
            }

            const eliminado = await Productos.eliminar(id);

            if (!eliminado) {
                throw new Error('No se pudo eliminar el producto');
            }

            return { mensaje: 'Producto eliminado correctamente' };
        } catch (error) {
            throw new Error(`Error al eliminar producto: ${error.message}`);
        }
    }

    static async obtenerProductosDestacados(limite) {
        try {
        const lim = parseInt(limite, 10);
        if (isNaN(lim) || lim <= 0) throw new Error("Límite inválido");

            return await Productos.obtenerDestacados(limite);
        } catch (error) {
            throw new Error(`Error al obtener productos destacados: ${error.message}`);
        }
    }

static async obtenerProductosConImagenes(busqueda, categoria_id){
    try {
        const catId = parseInt(categoria_id) || 0; 

        return await Productos.obtenerProductosFiltrados(busqueda, catId);
    } catch (error) {
        throw new Error(`Error al obtener productos con filtros: ${error.message}`);
    }
}

}

module.exports = ProductosService;