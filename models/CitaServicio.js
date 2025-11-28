const { supabaseAdmin } = require('../config/db');

class CitaServicio {
    static async create(citaData) {
        const {
            servicio_id,
            nombre_cliente,
            nombre,
            email_cliente,
            email,
            telefono_cliente,
            telefono,
            direccion_cliente,
            direccion,
            fecha_cita,
            fecha,
            descripcion_problema,
            descripcion,
            estado = 'pendiente',
            estado_pago = 'pendiente',
            orden_id = null
        } = citaData;

        const citaNormalizada = {
            servicio_id,
            nombre_cliente: nombre_cliente || nombre,
            email_cliente: email_cliente || email,
            telefono_cliente: telefono_cliente || telefono,
            direccion_cliente: direccion_cliente || direccion,
            fecha_cita: fecha_cita || fecha,
            descripcion_problema: descripcion_problema || descripcion,
            estado,
            estado_pago,
            orden_id
        };

        const { data, error } = await supabaseAdmin
            .from('citas_servicios')
            .insert([citaNormalizada])
            .select();

        if (error) throw error;
        return data[0];
    }

    static async findAll() {
        const { data, error } = await supabaseAdmin
            .from('citas_servicios')
            .select(`
                *,
                servicios(id, nombre, precio, descripcion)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    static async findById(id) {
        if (!id) {
            throw new Error('El ID de la cita es requerido');
        }

        const { data, error } = await supabaseAdmin
            .from('citas_servicios')
            .select(`
                *,
                servicios(id, nombre, precio, descripcion)
            `)
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data || null;
    }

    static async updateStatus(id, estado) {
        if (!id || !estado) {
            throw new Error('El ID de la cita y el estado son requeridos');
        }

        const { error } = await supabaseAdmin
            .from('citas_servicios')
            .update({ estado })
            .eq('id', id);

        if (error) throw error;
        return this.findById(id);
    }

    static async updateEstadoPago(id, estadoPago, ordenId = null) {
        if (!id || !estadoPago) {
            throw new Error('El ID de la cita y el estado de pago son requeridos');
        }

        const { error } = await supabaseAdmin
            .from('citas_servicios')
            .update({ 
                estado_pago: estadoPago,
                orden_id: ordenId
            })
            .eq('id', id);

        if (error) throw error;
        return this.findById(id);
    }

    static async actualizar(id, data) {
        if (!id) {
            throw new Error('El ID de la cita es requerido');
        }

        const camposPermitidos = [
            'servicio_id', 'nombre_cliente', 'email_cliente', 'telefono_cliente',
            'direccion_cliente', 'fecha_cita', 'descripcion_problema',
            'estado', 'estado_pago', 'orden_id'
        ];

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
            .from('citas_servicios')
            .update(camposAActualizar)
            .eq('id', id);

        if (error) throw error;
        return this.findById(id);
    }

    static async delete(id) {
        if (!id) {
            throw new Error('El ID de la cita es requerido');
        }

        const { error } = await supabaseAdmin
            .from('citas_servicios')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
}

module.exports = CitaServicio;

