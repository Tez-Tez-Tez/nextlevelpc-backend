const categoriaService = require('../services/categoriaService');

class CategoriaController {
   static async getCategorias(req, res) {
        try {
            const categorias = await categoriaService.getAllCategorias();
            res.json(categorias);
        } catch (error) {
            console.error('Error en getCategorias:', error.message);
            res.status(500).json({ error: error.message });
        }
    }

   static async getCategoriasProductos(req, res) {
    try {
        const categorias = await categoriaService.getCategoriasProductos();
        res.json(categorias);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


    static async getCategoria(req, res) {
        try {
            const { id } = req.params;
            const categoria = await categoriaService.getCategoriaById(id);
            if (!categoria) {
                return res.status(404).json({ error: 'Categoría no encontrada' });
            }
            res.json(categoria);
        } catch (error) {
            console.error('Error en getCategoria:', error.message);
            res.status(500).json({ error: error.message });
        }
    }

    static async createCategoria(req, res) {
        try {
            const categoria = await categoriaService.createCategoria(req.body);
            res.status(201).json({
                message: "Categoría creada correctamente",
                id: categoria.id,
                nombre: categoria.nombre,
                tipo: categoria.tipo
            });
        } catch (error) {
            console.error('Error en createCategoria:', error.message);
            res.status(400).json({ error: error.message });
        }
    }

   static async updateCategoria(req, res) {
        try {
            const { id } = req.params;
            const categoria = await categoriaService.updateCategoria(id, req.body);
            res.json({
                message: "Categoría actualizada correctamente",
                id: categoria.id,
                nombre: categoria.nombre,
                tipo: categoria.tipo
            });
        } catch (error) {
            console.error('Error en updateCategoria:', error.message);
            res.status(400).json({ error: error.message });
        }
    }

    static async deleteCategoria(req, res) {
        try {
            const { id } = req.params;
            await categoriaService.deleteCategoria(id);
            res.json({
                message: "Categoría eliminada correctamente",
                id: parseInt(id)
            });
        } catch (error) {
            console.error('Error en deleteCategoria:', error.message);
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = CategoriaController;