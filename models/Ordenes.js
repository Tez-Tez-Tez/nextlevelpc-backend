const { supabaseAdmin } = require('../config/db');
const UsuariosService = require('../services/UsuariosService');

class Ordenes {
    static async crear(data) {
        const { cliente_id, tipo, total = 0.00, cita_servicio_id = null } = data;

        // Validaciones básicas
        if (!tipo || !['producto', 'servicio', 'mixto'].includes(tipo)) {
            throw new Error('Tipo debe ser "producto", "servicio" o "mixto"');
        }

        if (total < 0) {
            throw new Error('El total no puede ser negativo');
        }

        // Verificar que el cliente existe (si se proporciona)
        if (cliente_id) {
            const { data: cliente, error } = await supabaseAdmin
                .from('usuarios')
                .select('id')
                .eq('id', cliente_id)
                .single();

            if (error || !cliente) {
                throw new Error('El cliente especificado no existe');
            }
        }

        const numero_orden = `ORD-${Date.now()}`;

        const { data: result, error } = await supabaseAdmin
            .from('ordenes')
            .insert([{
                cliente_id,
                tipo,
                numero_orden,
                total,
                estado_orden: 'pendiente',
                estado_pago: 'pendiente',
                cita_servicio_id
            }])
            .select();

        if (error) throw error;
        return result[0].id;
    }

    static async obtenerTodos() {
        const { data, error } = await supabaseAdmin
            .from('ordenes')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Enriquecer con datos del usuario si existe cliente_id
        const ordenesConCliente = await Promise.all(
            (data || []).map(async (o) => {
                if (o.cliente_id) {
                    try {
                        const { data: usuario, error: userError } = await supabaseAdmin
                            .from('usuarios')
                            .select('nombre, apellido, correo')
                            .eq('id', o.cliente_id)
                            .single();
                        
                        if (!userError && usuario) {
                            return {
                                ...o,
                                cliente_nombre: usuario.nombre,
                                cliente_apellido: usuario.apellido,
                                cliente_correo: usuario.correo
                            };
                        }
                    } catch (e) {
                        console.error('Error obteniendo usuario para orden:', e);
                    }
                }
                return o;
            })
        );

        return ordenesConCliente;
    }

    static async obtenerPorId(id) {
        if (!id) {
            throw new Error('El ID de la orden es requerido');
        }

        const { data, error } = await supabaseAdmin
            .from('ordenes')
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        if (!data) return null;

        // Enriquecer con datos del usuario si existe cliente_id
        let ordenEnriquecida = { ...data };
        if (data.cliente_id) {
            try {
                const { data: usuario, error: userError } = await supabaseAdmin
                    .from('usuarios')
                    .select('nombre, apellido, correo')
                    .eq('id', data.cliente_id)
                    .single();
                
                if (!userError && usuario) {
                    ordenEnriquecida.cliente_nombre = usuario.nombre;
                    ordenEnriquecida.cliente_apellido = usuario.apellido;
                    ordenEnriquecida.cliente_correo = usuario.correo;
                }
            } catch (e) {
                console.error('Error obteniendo usuario para orden:', e);
            }
        }

        return ordenEnriquecida;
    }

    static async actualizar(id, data) {
        if (!id) {
            throw new Error('El ID de la orden es requerido');
        }

        // Verificar que la orden existe
        const ordenExiste = await this.obtenerPorId(id);
        if (!ordenExiste) {
            throw new Error('Orden no encontrada');
        }

        const camposPermitidos = ['estado_orden', 'estado_pago', 'total', 'tipo', 'cita_servicio_id'];
        const camposAActualizar = {};
        
        camposPermitidos.forEach(campo => {
            if (campo in data) {
                camposAActualizar[campo] = data[campo];
            }
        });

        if (Object.keys(camposAActualizar).length === 0) {
            throw new Error('No hay campos válidos para actualizar');
        }

        // Validaciones adicionales
        if (data.total !== undefined && data.total < 0) {
            throw new Error('El total no puede ser negativo');
        }

        if (data.tipo !== undefined && !['producto', 'servicio', 'mixto'].includes(data.tipo)) {
            throw new Error('Tipo debe ser "producto", "servicio" o "mixto"');
        }

        if (data.estado_orden !== undefined && !['pendiente', 'procesando', 'completada', 'cancelada'].includes(data.estado_orden)) {
            throw new Error('Estado de orden inválido');
        }

        if (data.estado_pago !== undefined && !['pendiente', 'pagado', 'reembolsado'].includes(data.estado_pago)) {
            throw new Error('Estado de pago inválido');
        }

        const { error } = await supabaseAdmin
            .from('ordenes')
            .update(camposAActualizar)
            .eq('id', id);

        if (error) throw error;
        
        // Esperar y retornar la orden actualizada
        const ordenActualizada = await this.obtenerPorId(id);
        return ordenActualizada;

    }

    static async eliminar(id) {
        if (!id) {
            throw new Error('El ID de la orden es requerido');
        }

        // Verificar que la orden existe
        const ordenExiste = await this.obtenerPorId(id);
        if (!ordenExiste) {
            throw new Error('Orden no encontrada');
        }

        const { error } = await supabaseAdmin
            .from('ordenes')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }

    static async obtenerPorCliente(clienteId) {
        if (!clienteId) {
            throw new Error('El ID del cliente es requerido');
        }

        const { data, error } = await supabaseAdmin
            .from('ordenes')
            .select('*')
            .eq('cliente_id', clienteId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    static async obtenerPorNumeroOrden(numeroOrden) {
        if (!numeroOrden) {
            throw new Error('El número de orden es requerido');
        }

        const { data, error } = await supabaseAdmin
            .from('ordenes')
            .select('*')
            .eq('numero_orden', numeroOrden)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        if (!data) return null;

        // Enriquecer con datos del usuario si existe cliente_id
        let ordenEnriquecida = { ...data };
        if (data.cliente_id) {
            try {
                const { data: usuario, error: userError } = await supabaseAdmin
                    .from('usuarios')
                    .select('nombre, apellido, correo')
                    .eq('id', data.cliente_id)
                    .single();
                
                if (!userError && usuario) {
                    ordenEnriquecida.cliente_nombre = usuario.nombre;
                    ordenEnriquecida.cliente_apellido = usuario.apellido;
                    ordenEnriquecida.cliente_correo = usuario.correo;
                }
            } catch (e) {
                console.error('Error obteniendo usuario para orden:', e);
            }
        }

        return ordenEnriquecida;
    }
}

module.exports = Ordenes;