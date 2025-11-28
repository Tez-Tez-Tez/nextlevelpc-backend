const { supabaseAdmin } = require('../config/db.js');

class Roles {
    static async crear(data) {
        const { nombre } = data;

        const { data: result, error } = await supabaseAdmin
            .from('roles')
            .insert([{ nombre }])
            .select();

        if (error) throw error;
        return result[0].id;
    }

    static async obtenerTodos() {
        const { data, error } = await supabaseAdmin
            .from('roles')
            .select('*')
            .order('id');

        if (error) throw error;
        return data;
    }

    static async obtenerPorId(id) {
        const { data, error } = await supabaseAdmin
            .from('roles')
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data || null;
    }

    static async obtenerPorNombre(nombre) {
        const { data, error } = await supabaseAdmin
            .from('roles')
            .select('*')
            .eq('nombre', nombre)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data || null;
    }

    static async actualizar(id, data) {
        const { error } = await supabaseAdmin
            .from('roles')
            .update(data)
            .eq('id', id);

        if (error) throw error;
        return true;
    }

    static async eliminar(id) {
        // Verificar si el rol está siendo usado antes de eliminar
        const { count, error: countError } = await supabaseAdmin
            .from('usuarios')
            .select('id', { count: 'exact', head: true })
            .eq('rol_id', id);

        if (countError) throw countError;
        if (count > 0) {
            throw new Error('No se puede eliminar el rol porque está siendo usado por uno o más usuarios');
        }

        const { error } = await supabaseAdmin
            .from('roles')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }

    static async verificarUso(id) {
        const { count, error } = await supabaseAdmin
            .from('usuarios')
            .select('id', { count: 'exact', head: true })
            .eq('rol_id', id);

        if (error) throw error;
        return count > 0;
    }

    static async obtenerRolesConConteoUsuarios() {
        // Supabase no soporta directamente GROUP BY, así que lo hacemos manualmente
        const { data: roles, error: rolesError } = await supabaseAdmin
            .from('roles')
            .select('*')
            .order('id');

        if (rolesError) throw rolesError;

        const rolesConConteo = await Promise.all(roles.map(async (rol) => {
            const { count, error } = await supabaseAdmin
                .from('usuarios')
                .select('id', { count: 'exact', head: true })
                .eq('rol_id', rol.id);

            if (error) throw error;
            return { ...rol, total_usuarios: count };
        }));

        return rolesConConteo;
    }
}

module.exports = Roles;