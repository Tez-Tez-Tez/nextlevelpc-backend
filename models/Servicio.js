const { supabaseAdmin } = require('../config/db');

class Servicio {

    static async findAll() {
        const { data, error } = await supabaseAdmin
            .from('servicios')
            .select('*')
            .eq('activo', 1)
            .order('tipo')
            .order('nombre');

        if (error) throw error;
        return data;
    }


    static async findByTipo(tipo) {
        const { data, error } = await supabaseAdmin
            .from('servicios')
            .select('*')
            .eq('activo', 1)
            .eq('tipo', tipo)
            .order('nombre');

        if (error) throw error;
        return data;
    }


    static async findById(id) {
        // Get service basic data
        const { data: servicio, error: servicioError } = await supabaseAdmin
            .from('servicios')
            .select('*')
            .eq('id', id)
            .eq('activo', 1)
            .single();

        if (servicioError && servicioError.code !== 'PGRST116') throw servicioError;
        if (!servicio) return null;

        // Get gallery images
        const { data: imagenes, error: imagenesError } = await supabaseAdmin
            .from('servicio_imagenes')
            .select('id, url, alt_text, orden, es_principal')
            .eq('servicio_id', id)
            .eq('activo', 1)
            .order('orden');

        if (imagenesError) console.error('Error al obtener imágenes:', imagenesError);

        // Attach images to service object
        servicio.galeria_imagenes = imagenes || [];

        return servicio;
    }


    static async create(servicioData) {
        const { nombre, tipo = 'basico', precio, descripcion = null, imagen_url = null } = servicioData;

        const { data, error } = await supabaseAdmin
            .from('servicios')
            .insert([{ nombre, tipo, precio, descripcion, imagen_url, activo: 1 }])
            .select();

        if (error) throw error;
        return this.findById(data[0].id);
    }


    static async update(id, servicioData) {
        const { nombre, tipo, precio, descripcion, imagen_url } = servicioData;

        const { error } = await supabaseAdmin
            .from('servicios')
            .update({ nombre, tipo, precio, descripcion, imagen_url })
            .eq('id', id)
            .eq('activo', 1);

        if (error) throw error;
        return this.findById(id);
    }


    static async delete(id) {
        const { error } = await supabaseAdmin
            .from('servicios')
            .update({ activo: 0 })
            .eq('id', id);

        if (error) throw error;
        return true;
    }


    static async findByNombre(nombre, excludeId = null) {
        let query = supabaseAdmin
            .from('servicios')
            .select('*')
            .eq('nombre', nombre)
            .eq('activo', 1);

        if (excludeId) {
            query = query.neq('id', excludeId);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data.length > 0 ? data[0] : null;
    }

    static async contarPorCategoria(categoria_id) {
        const { count, error } = await supabaseAdmin
            .from('servicios')
            .select('id', { count: 'exact', head: true })
            .eq('categoria_id', categoria_id);

        if (error) throw error;
        return count;
    }
}

module.exports = Servicio;