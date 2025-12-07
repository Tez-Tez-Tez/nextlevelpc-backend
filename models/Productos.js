const { supabaseAdmin } = require('../config/db.js');

class Productos {
    static async crear(data) {
        const { nombre, categoria_id, precio_actual, stock, estado } = data;

        const { data: result, error } = await supabaseAdmin
            .from('productos')
            .insert([{ nombre, categoria_id, precio_actual, stock, estado: estado || 1 }])
            .select();

        if (error) throw error;
        return result[0].id;
    }

    static async obtenerTodos() {
        const { data, error } = await supabaseAdmin
            .from('productos')
            .select('*');

        if (error) throw error;
        return data;
    }

    static async buscarPorNombre(searchTerm) {
        const { data, error } = await supabaseAdmin
            .from('productos')
            .select(`
                *,
                categorias(nombre),
                imagenes_productos(url, es_principal)
            `)
            .ilike('nombre', `%${searchTerm}%`)
            .eq('estado', 1)
            .order('nombre');

        if (error) throw error;

        return data.map(p => ({
            ...p,
            categoria_nombre: p.categorias?.nombre,
            imagen_principal: p.imagenes_productos?.[0]?.url
        }));
    }

    static async obtenerActivos() {
        const { data, error } = await supabaseAdmin
            .from('productos')
            .select('*')
            .eq('estado', 1);

        if (error) throw error;
        return data;
    }

    static async obtenerPorId(id) {
        const { data: productRows, error: productError } = await supabaseAdmin
            .from('productos')
            .select(`
                *,
                categorias(nombre)
            `)
            .eq('id', id)
            .single();

        if (productError && productError.code !== 'PGRST116') throw productError;
        if (!productRows) return null;

        const { data: imagenesRows, error: imagenesError } = await supabaseAdmin
            .from('imagenes_productos')
            .select('url, es_principal')
            .eq('producto_id', id)
            .order('es_principal', { ascending: false });

        if (imagenesError) console.error('Error al obtener imágenes:', imagenesError);

        const producto = { ...productRows, categoria_nombre: productRows.categorias?.nombre };
        producto.imagenes = imagenesRows || [];
        producto.imagen_principal = imagenesRows && imagenesRows.length > 0 ? imagenesRows[0].url : null;

        return producto;
    }

    static async obtenerPorCategoria(categoria_id) {
        const { data, error } = await supabaseAdmin
            .from('productos')
            .select('*')
            .eq('categoria_id', categoria_id);

        if (error) throw error;
        return data;
    }

    static async actualizar(id, data) {
        const { error } = await supabaseAdmin
            .from('productos')
            .update(data)
            .eq('id', id);

        if (error) throw error;
        return true;
    }

    static async eliminar(id) {
        const { error } = await supabaseAdmin
            .from('productos')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }

    static async productosConImagenes() {
        const { data, error } = await supabaseAdmin
            .from('productos')
            .select(`
                *,
                imagenes_productos(url)
            `);

        if (error) throw error;
        return data;
    }

    static async obtenerTodosConImagenes() {
        const { data, error } = await supabaseAdmin
            .from('productos')
            .select(`
                *,
                categorias(nombre),
                imagenes_productos(url, es_principal)
            `)
            .order('nombre');

        if (error) throw error;

        return data.map(p => ({
            ...p,
            categoria_nombre: p.categorias?.nombre,
            imagen_principal: p.imagenes_productos?.find(img => img.es_principal)?.url || p.imagenes_productos?.[0]?.url
        }));
    }

    static async obtenerDestacados(limite) {
        const { data, error } = await supabaseAdmin
            .from('productos')
            .select(`
                *,
                imagenes_productos(url, es_principal)
            `)
            .eq('estado', 1)
            .gt('stock', 0)
            .order('stock', { ascending: false })
            .limit(parseInt(limite));

        if (error) throw error;

        return data.map(p => ({
            ...p,
            imagen_principal: p.imagenes_productos?.find(img => img.es_principal)?.url || p.imagenes_productos?.[0]?.url
        }));
    }

    static async obtenerProductosFiltrados(busqueda, categoriaId) {
        let query = supabaseAdmin
            .from('productos')
            .select(`
                id,
                nombre,
                precio_actual,
                stock,
                estado,
                categorias(nombre),
                imagenes_productos(url, es_principal)
            `);

        if (busqueda && busqueda.trim() !== '') {
            query = query.ilike('nombre', `%${busqueda}%`);
        }

        if (categoriaId && categoriaId > 0) {
            query = query.eq('categoria_id', categoriaId);
        }

        const { data, error } = await query.order('nombre');

        if (error) throw error;

        return data.map(p => ({
            ...p,
            categoria_nombre: p.categorias?.nombre,
            imagen_principal: p.imagenes_productos?.find(img => img.es_principal)?.url || p.imagenes_productos?.[0]?.url
        }));
    }

    static async contarPorCategoria(categoria_id) {
        const { count, error } = await supabaseAdmin
            .from('productos')
            .select('id', { count: 'exact', head: true })
            .eq('categoria_id', categoria_id);

        if (error) throw error;
        return count;
    }
}

module.exports = Productos;