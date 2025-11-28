const bcrypt = require('bcrypt');
const { supabaseAdmin } = require('../config/db.js');

class Usuarios {

    static async crear(dto) {
        console.log('Usuarios.crear - DTO recibido:', dto);
        
        const { nombre, apellido, correo, hash_password, rol_id} = dto;
        console.log('Valores extraídos:', { nombre, apellido, correo, rol_id });
        
        const hashPassword = await bcrypt.hash(hash_password, 10);
        console.log('Password hasheada');

        const { data, error } = await supabaseAdmin
            .from('usuarios')
            .insert([{ nombre, apellido, correo, hash_password: hashPassword, rol_id }])
            .select();

        if (error) {
            console.error('Error de Supabase:', error);
            throw error;
        }
        
        console.log('Usuario creado en BD:', data);
        return data[0].id;
    }

    static async obtenerTodos() {
        const { data, error } = await supabaseAdmin
            .from('usuarios')
            .select('*');

        if (error) throw error;
        return data;
    }

    static async obtenerPorId(id) {
        const { data, error } = await supabaseAdmin
            .from('usuarios')
            .select(`
                *,
                roles(nombre)
            `)
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        
        if (!data) return null;
        
        return {
            ...data,
            rol_nombre: data.roles?.nombre
        };
    }

    static async obtenerPorCorreo(correo) {
        const { data, error } = await supabaseAdmin
            .from('usuarios')
            .select(`
                *,
                roles(nombre)
            `)
            .eq('correo', correo)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        
        if (!data) return null;
        
        return {
            ...data,
            rol_nombre: data.roles?.nombre
        };
    }

    static async correoEnUso(correo, id) {
        const { data, error } = await supabaseAdmin
            .from('usuarios')
            .select('*')
            .eq('correo', correo)
            .neq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data || null;
    }

    static async actualizar(id, dto) {
        if (dto.hash_password && !dto.hash_password.startsWith('$2b$')) {
            const hashPassword = await bcrypt.hash(dto.hash_password, 10);
            dto.hash_password = hashPassword;
        }

        const { error } = await supabaseAdmin
            .from('usuarios')
            .update(dto)
            .eq('id', id);

        if (error) throw error;
        return true;
    }

    static async eliminar(id) {
        const { error } = await supabaseAdmin
            .from('usuarios')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }

    static async obtenerRoles() {
        const { data, error } = await supabaseAdmin
            .from('usuarios')
            .select(`
                *,
                roles(nombre)
            `);

        if (error) throw error;
        return data.map(u => ({ ...u, rol: u.roles?.nombre }));
    }

    static async guardarRefreshToken(userId, token, expiresAt) {
        const { data, error } = await supabaseAdmin
            .from('refresh_tokens')
            .insert([{ user_id: userId, token, expires_at: expiresAt }])
            .select();

        if (error) throw error;
        return data[0];
    }

static async obtenerRefreshToken(token) {
    if (!token) {
        throw new Error('El token es requerido');
    }

    const { data, error } = await supabaseAdmin
        .from('refresh_tokens')
        .select('user_id')
        .eq('token', token)
        .gt('expires_at', new Date().toISOString())
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
}

static async eliminarRefreshToken(token) {
    if (!token) {
        throw new Error('El token es requerido');
    }

    const { error } = await supabaseAdmin
        .from('refresh_tokens')
        .delete()
        .eq('token', token);

    if (error) throw error;
    return true;
}
}

module.exports = Usuarios;
