const { db, supabaseAdmin } = require('../config/db');

class Categoria {
    static async findAll() {
        try {
            const { data, error } = await supabaseAdmin
                .from('categorias')
                .select('*')
                .order('nombre');

            if (error) throw error;

            return data.map(row => ({
                id: row.id,
                nombre: row.nombre,
                tipo: row.tipo
            }));
        } catch (error) {
            console.error('Error en Categoria.findAll:', error.message);
            throw new Error('Error al obtener categorías de la base de datos');
        }
    }

    static async findAllProductos() {
    try {
        const { data, error } = await supabaseAdmin
            .from('categorias')
            .select('*')
            .eq('tipo', 'producto')
            .order('nombre');

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error en Categoria.findAllProductos:', error.message);
        throw new Error('Error al obtener categorías de productos');
    }
}


    static async findById(id) {
        try {
            const { data, error } = await supabaseAdmin
                .from('categorias')
                .select('*')
                .eq('id', id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (!data) return null;

            return {
                id: data.id,
                nombre: data.nombre,
                tipo: data.tipo
            };
        } catch (error) {
            console.error('Error en Categoria.findById:', error.message);
            throw new Error('Error al obtener la categoría');
        }
    }

    static async create(dto) {
        try {
            const {nombre,tipo} = dto;
            
            const { data, error } = await supabaseAdmin
                .from('categorias')
                .insert([{ nombre, tipo: tipo || 'producto' }])
                .select();

            if (error) throw error;

            return this.findById(data[0].id);
        } catch (error) {
            console.error('Error en Categoria.create:', error.message);

            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Ya existe una categoría con este nombre');
            }

            throw new Error('Error al crear la categoría');
        }
    }

    static async update(id, categoriaData) {
        try {
            const { data, error } = await supabaseAdmin
                .from('categorias')
                .update(categoriaData)
                .eq('id', id)
                .select();

            if (error) throw error;

            return this.findById(id);
        } catch (error) {
            console.error('Error en Categoria.update:', error.message);

            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Ya existe una categoría con este nombre');
            }

            throw new Error('Error al actualizar la categoría: ' + error.message);
        }
    }

    static async delete(id) {
        try {
            const { error } = await supabaseAdmin
                .from('categorias')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error en Categoria.delete:', error.message);
            throw new Error('Error al eliminar la categoría');
        }
    }

    static async exists(nombre, excludeId = null) {
        try {
            let query = supabaseAdmin
                .from('categorias')
                .select('id', { count: 'exact' })
                .eq('nombre', nombre);

            if (excludeId) {
                query = query.neq('id', excludeId);
            }

            const { count, error } = await query;

            if (error) throw error;
            return count > 0;
        } catch (error) {
            console.error('Error en Categoria.exists:', error.message);
            return false;
        }
    }

    static async getForName(){
        try {
            const { data, error } = await supabaseAdmin
                .from('categorias')
                .select('id, nombre')
                .order('nombre');

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error al obtener categorias: ',{message: error.message})
            throw error;
        }
    }
}

module.exports = Categoria;