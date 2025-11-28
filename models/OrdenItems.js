const { supabaseAdmin } = require('../config/db');

class OrdenItems {
    static async crear(data) {
        const { 
            orden_id, 
            tipo, 
            producto_id,
            servicio_id,
            descripcion, 
            cantidad = 1, 
            precio_unitario 
        } = data;

        // Validaciones básicas
        if (!orden_id || !tipo || !descripcion || !precio_unitario) {
            throw new Error('Faltan campos requeridos para crear item de orden');
        }

        // Validar que cantidad sea positiva
        if (cantidad <= 0) {
            throw new Error('La cantidad debe ser mayor a 0');
        }

        // Validar que precio sea válido
        if (precio_unitario <= 0) {
            throw new Error('El precio unitario debe ser mayor a 0');
        }

        const subtotal = precio_unitario * cantidad;

        const { data: result, error } = await supabaseAdmin
            .from('orden_items')
            .insert([{
                orden_id,
                tipo,
                producto_id,
                servicio_id,
                descripcion,
                cantidad,
                precio_unitario,
                subtotal
            }])
            .select();

        if (error) throw error;
        return result[0].id;
    }

    static async obtenerTodos() {
        const { data, error } = await supabaseAdmin
            .from('orden_items')
            .select(`
                *,
                productos(nombre, precio_actual),
                servicios(nombre, precio),
                ordenes(numero_orden, cliente_id)
            `)
            .order('id', { ascending: false });

        if (error) throw error;

        return data.map(oi => ({
            ...oi,
            producto_nombre: oi.productos?.nombre,
            precio_actual: oi.productos?.precio_actual,
            servicio_nombre: oi.servicios?.nombre,
            servicio_precio: oi.servicios?.precio,
            numero_orden: oi.ordenes?.numero_orden,
            cliente_id: oi.ordenes?.cliente_id
        }));
    }

    static async obtenerPorId(id) {
        const { data, error } = await supabaseAdmin
            .from('orden_items')
            .select(`
                *,
                productos(nombre, precio_actual, stock),
                servicios(nombre, precio),
                ordenes(numero_orden, cliente_id, estado_orden, estado_pago)
            `)
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        if (!data) return null;

        return {
            ...data,
            producto_nombre: data.productos?.nombre,
            precio_actual: data.productos?.precio_actual,
            stock: data.productos?.stock,
            servicio_nombre: data.servicios?.nombre,
            servicio_precio: data.servicios?.precio,
            numero_orden: data.ordenes?.numero_orden,
            cliente_id: data.ordenes?.cliente_id,
            estado_orden: data.ordenes?.estado_orden,
            estado_pago: data.ordenes?.estado_pago
        };
    }

    static async obtenerPorOrden(ordenId) {
        if (!ordenId) {
            throw new Error('El ID de la orden es requerido');
        }

        const { data, error } = await supabaseAdmin
            .from('orden_items')
            .select(`
                *,
                productos(nombre, precio_actual, stock),
                servicios(nombre, precio)
            `)
            .eq('orden_id', ordenId)
            .order('id');

        if (error) throw error;

        return data.map(oi => ({
            ...oi,
            producto_nombre: oi.productos?.nombre,
            precio_actual: oi.productos?.precio_actual,
            stock: oi.productos?.stock,
            servicio_nombre: oi.servicios?.nombre,
            servicio_precio: oi.servicios?.precio
        }));
    }

    static async actualizar(id, data) {
        const camposPermitidos = ['cantidad', 'precio_unitario', 'subtotal', 'descripcion'];
        const camposAActualizar = {};

        camposPermitidos.forEach(campo => {
            if (campo in data) {
                camposAActualizar[campo] = data[campo];
            }
        });

        if (Object.keys(camposAActualizar).length === 0) {
            throw new Error('No hay campos válidos para actualizar');
        }

        const { error } = await supabaseAdmin
            .from('orden_items')
            .update(camposAActualizar)
            .eq('id', id);

        if (error) throw error;
        return this.obtenerPorId(id);
    }

    static async eliminar(id) {
        const { error } = await supabaseAdmin
            .from('orden_items')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }

    static async eliminarPorOrden(ordenId) {
        if (!ordenId) {
            throw new Error('El ID de la orden es requerido');
        }

        const { error } = await supabaseAdmin
            .from('orden_items')
            .delete()
            .eq('orden_id', ordenId);

        if (error) throw error;
        return true;
    }

    static async obtenerTotalOrden(ordenId) {
        if (!ordenId) {
            throw new Error('El ID de la orden es requerido');
        }

        const { data, error } = await supabaseAdmin
            .from('orden_items')
            .select('subtotal')
            .eq('orden_id', ordenId);

        if (error) throw error;

        const total = data.reduce((sum, item) => sum + (item.subtotal || 0), 0);
        return total;
    }
}

module.exports = OrdenItems;