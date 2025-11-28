class CreateProductoDto {
    constructor(payload = {}) {
        this.nombre = typeof payload.nombre === "string" ? payload.nombre.trim() : payload.nombre;
        this.categoria_id = payload.categoria_id;
        this.precio_actual = payload.precio_actual;
        this.stock = payload.stock !== undefined ? payload.stock : 0;
        this.estado = payload.estado !== undefined ? payload.estado : 1;
        // nuevos campos opcionales
        this.descripcion_corta = payload.descripcion_corta ?? null;
        this.descripcion_detallada = payload.descripcion_detallada ?? null;
        this.especificaciones = payload.especificaciones ?? null;
    }

    validate() {
        const errors = [];
        
        if (!this.nombre || this.nombre.trim() === '') {
            errors.push('nombre es requerido');
        }
        
        if (!this.categoria_id) {
            errors.push('categoria_id es requerido');
        }
        
        if (this.precio_actual === undefined || this.precio_actual === null) {
            errors.push('precio_actual es requerido');
        } else if (this.precio_actual < 0) {
            errors.push('precio no puede ser negativo');
        }
        
        if (this.stock < 0) {
            errors.push('stock no puede ser negativo');
        }
        
        return errors;
    }

    toModel() {
        return {
            nombre: this.nombre,
            categoria_id: this.categoria_id,
            precio_actual: this.precio_actual,
            stock: this.stock,
            estado: this.estado,
            descripcion_corta: this.descripcion_corta,
            descripcion_detallada: this.descripcion_detallada,
            especificaciones: this.especificaciones
        };
    }
}

class UpdateProductoDto {
    constructor(payload = {}) {
        this.nombre = payload.nombre === undefined ? undefined : (typeof payload.nombre === "string" ? payload.nombre.trim() : payload.nombre);
        this.categoria_id = payload.categoria_id;
        this.precio_actual = payload.precio_actual;
        this.stock = payload.stock;
        this.estado = payload.estado;
        // nuevos campos opcionales
        this.descripcion_corta = payload.descripcion_corta;
        this.descripcion_detallada = payload.descripcion_detallada;
        this.especificaciones = payload.especificaciones;
    }
    
    validate() {
        const errors = [];
        
        if (this.nombre !== undefined && !this.nombre) {
            errors.push('nombre no puede estar vacío');
        }
        
        if (this.precio_actual !== undefined && this.precio_actual < 0) {
            errors.push('precio no puede ser negativo');
        }
        
        if (this.stock !== undefined && this.stock < 0) {
            errors.push('stock no puede ser negativo');
        }
        
        return errors;
    }

    toPatchObject() {
        const out = {};
        ['nombre', 'categoria_id', 'precio_actual', 'stock', 'estado', 'descripcion_corta', 'descripcion_detallada', 'especificaciones'].forEach(k => {
            if (this[k] !== undefined)
                out[k] = this[k];
        });
        return out;
    }
}

module.exports = { CreateProductoDto, UpdateProductoDto };