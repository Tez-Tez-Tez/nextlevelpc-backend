class OrdenItemCreateDTO {
    constructor(payload = {}) {
        this.orden_id = payload.orden_id;
        this.tipo = payload.tipo;
        this.producto_id = payload.producto_id;
        this.servicio_id = payload.servicio_id;
        this.descripcion = typeof payload.descripcion === 'string' ? payload.descripcion.trim() : payload.descripcion;
        this.cantidad = payload.cantidad !== undefined ? payload.cantidad : 1;
        this.precio_unitario = payload.precio_unitario;
    }

    validate() {
        const errors = [];
        
        if (!this.orden_id) errors.push('orden_id es obligatorio');
        if (!this.tipo || !['producto', 'servicio'].includes(this.tipo)) 
            errors.push('tipo debe ser "producto" o "servicio"');
        if (!this.descripcion) errors.push('descripcion es obligatoria');
        if (this.precio_unitario === undefined || this.precio_unitario === null) 
            errors.push('precio_unitario es obligatorio');
        if (this.precio_unitario < 0) errors.push('precio_unitario debe ser un número positivo');
        if (this.cantidad < 1) errors.push('cantidad debe ser al menos 1');

        if (this.tipo === 'producto' && !this.producto_id) {
            errors.push('producto_id es obligatorio para items de tipo producto');
        }
        if (this.tipo === 'servicio' && !this.servicio_id) {
            errors.push('servicio_id es obligatorio para items de tipo servicio');
        }
     
        return errors;
    }

    toModel() {
        return {
            orden_id: this.orden_id,
            tipo: this.tipo,
            producto_id: this.producto_id,
            servicio_id: this.servicio_id,
            descripcion: this.descripcion,
            cantidad: this.cantidad,
            precio_unitario: this.precio_unitario
        };
    }
}

class OrdenItemUpdateDTO {
    constructor(payload = {}) {
        this.cantidad = payload.cantidad;
        this.precio_unitario = payload.precio_unitario;
        this.descripcion = payload.descripcion === undefined ? undefined : (typeof payload.descripcion === 'string' ? payload.descripcion.trim() : payload.descripcion);
    }

    validate() {
        const errors = [];
        
        if (this.cantidad !== undefined && this.cantidad < 1) 
            errors.push('cantidad debe ser al menos 1');
        if (this.precio_unitario !== undefined && this.precio_unitario < 0) 
            errors.push('precio_unitario debe ser un número positivo');
            
        return errors;
    }

    toPatchObject() {
        const out = {};
        ['cantidad', 'precio_unitario', 'descripcion'].forEach(k => {
            if (this[k] !== undefined) out[k] = this[k];
        });
        return out;
    }
}

class OrdenItemResponseDTO {
    constructor(item) {
        this.id = item.id;
        this.orden_id = item.orden_id;
        this.tipo = item.tipo;
        this.descripcion = item.descripcion;
        this.cantidad = item.cantidad;
        this.precio_unitario = parseFloat(item.precio_unitario || 0).toFixed(2);
        this.subtotal = parseFloat(item.subtotal || 0).toFixed(2);
        this.created_at = item.created_at;
        
        this.producto = item.producto_id ? {
            id: item.producto_id,
            nombre: item.producto_nombre
        } : null;

        this.servicio = item.servicio_id ? {
            id: item.servicio_id,
            nombre: item.servicio_nombre 
        } : null;
    }

    toSummary() {
        return {
            id: this.id,
            descripcion: this.descripcion,
            cantidad: this.cantidad,
            precio_unitario: this.precio_unitario,
            subtotal: this.subtotal,
            created_at: this.created_at
        };
    }

    toDetail() {
        return {
            ...this.toSummary(),
            orden_id: this.orden_id,
            tipo: this.tipo,
            producto: this.producto,
            servicio: this.servicio
        };
    }
}

module.exports = { 
    OrdenItemCreateDTO, 
    OrdenItemUpdateDTO, 
    OrdenItemResponseDTO 
};