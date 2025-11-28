class UsuarioCreateDTO {
    constructor(payload = {}) {
        this.nombre = typeof payload.nombre === 'string' ? payload.nombre.trim() : payload.nombre;
        this.apellido = typeof payload.apellido === 'string' ? payload.apellido.trim() : payload.apellido;
        this.correo = typeof payload.correo === 'string' ? payload.correo.trim() : payload.correo;
        this.hash_password = typeof payload.hash_password === 'string' ? payload.hash_password.trim() : payload.hash_password;
        this.rol_id = typeof payload.rol_id === 'number' ? payload.rol_id : 2;
    }

    validate() {
        const errors = [];
        if (!this.nombre) errors.push('nombre es obligatorio y no puede ser solo espacios');
        if (!this.apellido) errors.push('apellido es obligatorio y no puede ser solo espacios');
        if (!this.correo) errors.push('correo es obligatorio y no puede ser solo espacios');
        if (!this.hash_password) errors.push('password es obligatorio y no puede ser solo espacios');
        if (this.hash_password && this.hash_password.length < 6) errors.push('password debe tener al menos 6 caracteres');
        if (this.correo && !/^\S+@\S+\.\S+$/.test(this.correo)) errors.push('correo inválido');
        return errors;
    }

    toModel() {
        return {
            nombre: this.nombre,
            apellido: this.apellido,
            correo: this.correo,
            hash_password: this.hash_password,
            rol_id: this.rol_id
        };
    }
}

class UsuarioUpdateDTO {
    constructor(payload = {}) {
        this.nombre = payload.nombre === undefined ? undefined : (typeof payload.nombre === 'string' ? payload.nombre.trim() : payload.nombre);
        this.apellido = payload.apellido === undefined ? undefined : (typeof payload.apellido === 'string' ? payload.apellido.trim() : payload.apellido);
        this.correo = payload.correo === undefined ? undefined : (typeof payload.correo === 'string' ? payload.correo.trim() : payload.correo);
        this.hash_password = payload.hash_password === undefined ? undefined : (typeof payload.hash_password === 'string' ? payload.hash_password.trim() : payload.hash_password);
        this.rol_id = payload.rol_id === undefined ? undefined : (typeof payload.rol_id === 'number' ? payload.rol_id : undefined);
    }

    validate() {
        const errors = [];
        if (this.nombre !== undefined){
            if(!this.nombre){
                errors.push("nombre no puede ser solo espacios en blanco")
            }
        }
        if (this.apellido !== undefined){
            if(!this.apellido){
                errors.push("apellido no puede ser solo espacios en blanco")
            }
        }
        if (this.hash_password !== undefined) {
            if (!this.hash_password) errors.push('password no puede ser solo espacios');
            else if (this.hash_password.length < 6) errors.push('password debe tener al menos 6 caracteres');
        }
        if (this.correo !== undefined && this.correo && !/^\S+@\S+\.\S+$/.test(this.correo)) {
            errors.push('correo inválido');
        }
        return errors;
    }

    toPatchObject() {
        const out = {};
        ['nombre','apellido','correo','hash_password','rol_id'].forEach(k => {
            if (this[k] !== undefined) out[k] = this[k];
        });
        return out;
    }
}

class LoginDTO{
    constructor(payload = {}) {
        this.correo = typeof payload.correo === 'string' ? payload.correo.trim() : payload.correo;
        this.hash_password = typeof payload.hash_password === 'string' ? payload.hash_password.trim() : payload.hash_password;
    }
    validate() {
        const errors = [];
        if (!this.correo) errors.push('correo es obligatorio y no puede ser solo espacios');
        if (!this.hash_password) errors.push('password es obligatorio y no puede ser solo espacios');
        return errors;
    }

    toLogin(){
        return{
            correo: this.correo,
            hash_password:this.hash_password
        }
    }
}

module.exports = { UsuarioCreateDTO, UsuarioUpdateDTO, LoginDTO };