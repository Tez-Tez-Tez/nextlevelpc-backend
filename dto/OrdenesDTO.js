class OrdenCreateDTO {
    constructor(payload = {}) {
        this.cliente_id = payload.cliente_id;
        this.tipo = payload.tipo;
        this.total = payload.total || 0.00;
        this.cita_servicio_id = payload.cita_servicio_id || null;
    }

    validate() {
        const errors = [];
        
        if (!this.cliente_id) errors.push('cliente_id es obligatorio');
        if (!this.tipo || !['producto', 'servicio','mixto'].includes(this.tipo)) 
            errors.push('tipo debe ser "producto" o "servicio"');
        if (this.total < 0) errors.push('total no puede ser negativo');

        return errors;
    }

    toModel() {
        return {
            cliente_id: this.cliente_id,
            tipo: this.tipo,
            total: this.total,
            cita_servicio_id: this.cita_servicio_id
        };
    }
}

class OrdenUpdateDTO {
    constructor(payload = {}) {
        this.estado_orden = payload.estado_orden;
        this.estado_pago = payload.estado_pago;
        this.total = payload.total;
        this.tipo = payload.tipo;
        this.cita_servicio_id = payload.cita_servicio_id;
    }

    validate() {
        const errors = [];
        
        if (this.total !== undefined && this.total < 0) 
            errors.push('total no puede ser negativo');
        if (this.tipo !== undefined && !['producto', 'servicio','mixto'].includes(this.tipo)) 
            errors.push('tipo debe ser "producto" o "servicio"');
            
        return errors;
    }

    toPatchObject() {
        const out = {};
        ['estado_orden', 'estado_pago', 'total', 'tipo','cita_servicio_id'].forEach(k => {
            if (this[k] !== undefined) out[k] = this[k];
        });
        return out;
    }
}

class OrdenResponseDTO {
    constructor(orden) {
        this.id = orden.id;
        this.cliente_id = orden.cliente_id;
        this.tipo = orden.tipo;
        this.numero_orden = orden.numero_orden;
        this.total = parseFloat(orden.total || 0).toFixed(2);
        this.estado_orden = orden.estado_orden || 'pendiente';
        this.estado_pago = orden.estado_pago || 'pendiente';
        this.fecha_creacion = orden.created_at;
        this.cliente = orden.cliente_nombre ? {
            nombre: orden.cliente_nombre,
            apellido: orden.cliente_apellido,
            correo: orden.cliente_correo
        } : null;
        this.esta_pagada = this.estado_pago === 'pagado';
        this.esta_completada = this.estado_orden === 'completada';
        this.items = orden.items || [];
    }

    toSummary() {
        return {
            id: this.id,
            numero_orden: this.numero_orden,
            total: this.total,
            estado_orden: this.estado_orden,
            estado_pago: this.estado_pago,
            fecha_creacion: this.fecha_creacion,
            esta_pagada: this.esta_pagada,
            esta_completada: this.esta_completada
        };
    }

    toDetail() {
        return {
            ...this.toSummary(),
            cliente: this.cliente,
            tipo: this.tipo,
            items: this.items
        };
    }
}

module.exports = { 
    OrdenCreateDTO, 
    OrdenUpdateDTO, 
    OrdenResponseDTO 
};