const { supabaseAdmin } = require('../config/db');

class ImagenProducto {
    static async crear(data) {
        const { producto_id, url, es_principal = 0 } = data;
        
        const { data: result, error } = await supabaseAdmin
            .from('imagenes_productos')
            .insert([{ producto_id, url, es_principal }])
            .select();

        if (error) throw error;
        return result[0].id;
    }

    static async obtenerPorProducto(producto_id) {
        const { data, error } = await supabaseAdmin
            .from('imagenes_productos')
            .select('*')
            .eq('producto_id', producto_id)
            .order('es_principal', { ascending: false })
            .order('id');

        if (error) throw error;
        return data;
    }

    static async obtenerPrincipal(producto_id) {
        const { data, error } = await supabaseAdmin
            .from('imagenes_productos')
            .select('*')
            .eq('producto_id', producto_id)
            .eq('es_principal', 1)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data || null;
    }

    static async eliminar(id) {
        const { error } = await supabaseAdmin
            .from('imagenes_productos')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
    
    static async obtenerPorId(id) {
        const { data, error } = await supabaseAdmin
            .from('imagenes_productos')
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data || null;
    }

    static async establecerPrincipal(producto_id, imagen_id) {
        // Quitar principal de todas
        const { error: error1 } = await supabaseAdmin
            .from('imagenes_productos')
            .update({ es_principal: 0 })
            .eq('producto_id', producto_id);

        if (error1) throw error1;

        // Establecer nueva principal
        const { error: error2 } = await supabaseAdmin
            .from('imagenes_productos')
            .update({ es_principal: 1 })
            .eq('id', imagen_id)
            .eq('producto_id', producto_id);

        if (error2) throw error2;
        return true;
    }
}

module.exports = ImagenProducto;