class CreateServicioDto {
    constructor(payload = {}) {
        this.nombre = typeof payload.nombre === 'string' ? payload.nombre.trim() : payload.nombre;
        this.tipo = typeof payload.tipo === 'string' ? payload.tipo.trim() : payload.tipo;
        this.precio = payload.precio;
        this.descripcion = typeof payload.descripcion === 'string' ? payload.descripcion.trim() : payload.descripcion;
        this.imagen_url = typeof payload.imagen_url === 'string' ? payload.imagen_url.trim() : payload.imagen_url;
    }

    validate() {
        const errors = [];

        if (!this.nombre) {
            errors.push('El nombre es requerido');
        }

        if (this.tipo && !['basico', 'avanzado'].includes(this.tipo)) {
            errors.push('Tipo de servicio inválido. Use "basico" o "avanzado"');
        }

        if (this.precio === undefined || this.precio === null) {
            errors.push('El precio es requerido');
        } else if (Number(this.precio) <= 0) {
            errors.push('El precio debe ser mayor a 0');
        }

        return errors;
    }

    toModel() {
        return {
            nombre: this.nombre,
            tipo: this.tipo || 'basico',
            precio: Number(this.precio),
            descripcion: this.descripcion || null,
            imagen_url: this.imagen_url || null
        };
    }
}

class UpdateServicioDto {
    constructor(payload = {}) {
        this.nombre = payload.nombre === undefined ? undefined : (typeof payload.nombre === 'string' ? payload.nombre.trim() : payload.nombre);
        this.tipo = payload.tipo === undefined ? undefined : (typeof payload.tipo === 'string' ? payload.tipo.trim() : payload.tipo);
        this.precio = payload.precio;
        this.descripcion = payload.descripcion === undefined ? undefined : (typeof payload.descripcion === 'string' ? payload.descripcion.trim() : payload.descripcion);
        this.imagen_url = payload.imagen_url === undefined ? undefined : (typeof payload.imagen_url === 'string' ? payload.imagen_url.trim() : payload.imagen_url);
    }

    validate() {
        const errors = [];

        if (this.nombre !== undefined && !this.nombre) {
            errors.push('El nombre no puede estar vacío');
        }

        if (this.tipo !== undefined && !['basico', 'avanzado'].includes(this.tipo)) {
            errors.push('Tipo de servicio inválido. Use "basico" o "avanzado"');
        }

        if (this.precio !== undefined) {
            if (Number(this.precio) <= 0) {
                errors.push('El precio debe ser mayor a 0');
            }
        }

        return errors;
    }

    toPatchObject() {
        const out = {};
        ['nombre', 'tipo', 'precio', 'descripcion', 'imagen_url'].forEach(k => {
            if (this[k] !== undefined) {
                if (k === 'precio') {
                    out[k] = Number(this[k]);
                } else {
                    out[k] = this[k];
                }
            }
        });
        return out;
    }
}

module.exports = { CreateServicioDto, UpdateServicioDto };
