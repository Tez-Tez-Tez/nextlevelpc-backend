class CreateCategoriaDto {
    constructor(payload = {}){
        this.nombre = typeof payload.nombre === 'string' ? payload.nombre.trim() : payload.nombre;
        this.tipo = payload.tipo;
    }

    validate(){
        const errors = [];
        if(!this.nombre) errors.push('nombre no puede ser solo espacios y es requerido');
        if(!this.tipo || !['producto','servicio'].includes(this.tipo)) errors.push('tipo es obligatorio y debe ser producto o servicio')
        return errors;
    }

    toModel(){
        return{
            nombre :this.nombre,
            tipo: this.tipo
        }
    }
}

class UpdateCategoriaDto{
    constructor(payload = {}){
        this.nombre = payload.nombre === undefined ? undefined : (typeof payload.nombre === 'string' ? payload.nombre.trim() : payload.nombre)
        this.tipo = payload.tipo;
    }

    validate (){
        const errors = [];
        if(this.nombre.lenght === 0) errors.push('nombre no puede ser solo espacios en blanco')
        if(this.tipo){if(!['producto','servicio'].includes(this.tipo)) errors.push('tipo debe ser producto o servicio')}
        return errors;
    }

    toPatchObject(){
        const out = {};
        ['nombre','tipo'].forEach(k => {
            if (this[k] !== undefined) out[k] = this[k];
        });
        return out;
    }
}

module.exports = {CreateCategoriaDto,UpdateCategoriaDto};