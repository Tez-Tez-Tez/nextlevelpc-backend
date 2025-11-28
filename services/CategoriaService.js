const Categoria = require('../models/Categoria');
const { db } = require('../config/db');
const {CreateCategoriaDto,UpdateCategoriaDto} = require('../dto/CategoriasDto')

class CategoriaService {
    static async getAllCategorias() {
        try {
            return await Categoria.findAll();
        } catch (error) {
            throw new Error('Error al obtener categorías: ' + error.message);
        }
    }

   static async getCategoriasProductos() {
    try {
        return await Categoria.findAllProductos();
    } catch (error) {
        throw new Error(error.message);
    }
}

  static  async getCategoriaById(id) {
        try {
            const categoria = await Categoria.findById(id);
            if (!categoria) {
                throw new Error('Categoría no encontrada');
            }
            return categoria;
        } catch (error) {
            throw new Error('Error al obtener categoría: ' + error.message);
        }
    }

  static  async createCategoria(categoriaData) {
        try {
            const categoria = new CreateCategoriaDto(categoriaData);
            const errors = categoria.validate();

            if (errors.length > 0) {
                throw new Error('Errores de validación: ', errors.join(', '));
            }

            const exists = await Categoria.exists(categoria.nombre);
            if (exists) {
                throw new Error('Ya existe una categoría con este nombre');
            }

            return await Categoria.create(categoria.toModel());
        } catch (error) {
            throw new Error('Error al crear categoría: ' + error.message);
        }
    }

  static  async updateCategoria(id, categoriaData) {
        try {
            const categoria = await Categoria.findById(id);
            if (!categoria) {
                throw new Error('Categoría no encontrada');
            }

            const data = new UpdateCategoriaDto(categoriaData);
            const errores = data.validate();
            if(errores.length > 0){
                throw new Error('Errores de validación: ',errores.join(', '))
            }

            const patch = data.toPatchObject();
            if(Object.keys(patch).length === 0){
                throw new Error('No se enviaron campos para actualizar')
            }

            if (patch.nombre &&patch.nombre !== categoria.nombre) {
                const exists = await Categoria.exists(patch.nombre, id);
                if (exists) {
                    throw new Error('Ya existe una categoría con este nombre');
                }
            }

            return await Categoria.update(id,patch);
        } catch (error) {
            throw new Error('Error al actualizar categoría: ' + error.message);
        }
    }

  static  async deleteCategoria(id) {
        try {
            const categoria = await Categoria.findById(id);
            if (!categoria) {
                throw new Error('Categoría no encontrada');
            }

            const [productos] = await db.execute(
                'SELECT COUNT(*) as count FROM productos WHERE categoria_id = ?',
                [id]
            );
            const [servicios] = await db.execute(
                'SELECT COUNT(*) as count FROM servicios WHERE categoria_id = ?',
                [id]
            );

            if (productos[0].count > 0 || servicios[0].count > 0) {
                throw new Error('No se puede eliminar la categoría porque tiene productos o servicios asociados');
            }

            const deleted = await Categoria.delete(id);
            if (!deleted) {
                throw new Error('Error al eliminar la categoría');
            }

            return { message: 'Categoría eliminada correctamente' };
        } catch (error) {
            throw new Error('Error al eliminar categoría: ' + error.message);
        }
    }

    static async getForName(){
       try{ 
        const categorias = await Categoria.getForName();
        if(!categorias || categorias.length===0){
            throw new Error('No hay categorias aún')
        }
        return categorias;
    }catch(error){
       throw new Error('Error al obtener categorias: ',error.message)
    }
    }

}

module.exports = CategoriaService;