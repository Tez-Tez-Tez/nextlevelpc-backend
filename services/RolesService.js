const Roles = require('../models/Roles');

class RolesService {
    static async crearRol(rolData) {
        try {
            // Validaciones básicas
            if (!rolData.nombre || rolData.nombre.trim() === '') {
                throw new Error('El nombre del rol es obligatorio');
            }

            // Validar longitud del nombre
            if (rolData.nombre.length > 50) {
                throw new Error('El nombre del rol no puede exceder los 50 caracteres');
            }

            // Verificar si ya existe un rol con el mismo nombre
            const rolExistente = await Roles.obtenerPorNombre(rolData.nombre);
            if (rolExistente) {
                throw new Error('Ya existe un rol con ese nombre');
            }

            const rolId = await Roles.crear(rolData);
            return await Roles.obtenerPorId(rolId);
        } catch (error) {
            throw new Error(`Error al crear rol: ${error.message}`);
        }
    }

    static async obtenerTodosLosRoles() {
        try {
            return await Roles.obtenerTodos();
        } catch (error) {
            throw new Error(`Error al obtener roles: ${error.message}`);
        }
    }

    static async obtenerRolPorId(id) {
        try {
            if (!id) {
                throw new Error('ID de rol es requerido');
            }

            const rol = await Roles.obtenerPorId(id);

            if (!rol) {
                throw new Error('Rol no encontrado');
            }

            return rol;
        } catch (error) {
            throw new Error(`Error al obtener rol: ${error.message}`);
        }
    }

    static async obtenerRolPorNombre(nombre) {
        try {
            if (!nombre || nombre.trim() === '') {
                throw new Error('Nombre de rol es requerido');
            }

            const rol = await Roles.obtenerPorNombre(nombre);

            if (!rol) {
                throw new Error('Rol no encontrado');
            }

            return rol;
        } catch (error) {
            throw new Error(`Error al obtener rol por nombre: ${error.message}`);
        }
    }

    static async actualizarRol(id, rolData) {
        try {
            if (!id) {
                throw new Error('ID de rol es requerido');
            }

            // Verificar que el rol existe
            const rolExistente = await Roles.obtenerPorId(id);
            if (!rolExistente) {
                throw new Error('Rol no encontrado');
            }

            // Validaciones de datos
            if (rolData.nombre) {
                if (rolData.nombre.trim() === '') {
                    throw new Error('El nombre del rol no puede estar vacío');
                }

                if (rolData.nombre.length > 50) {
                    throw new Error('El nombre del rol no puede exceder los 50 caracteres');
                }

                // Verificar si el nuevo nombre ya existe en otro rol
                const rolConMismoNombre = await Roles.obtenerPorNombre(rolData.nombre);
                if (rolConMismoNombre && rolConMismoNombre.id !== parseInt(id)) {
                    throw new Error('Ya existe otro rol con ese nombre');
                }
            }

            const actualizado = await Roles.actualizar(id, rolData);

            if (!actualizado) {
                throw new Error('No se pudo actualizar el rol');
            }

            return await Roles.obtenerPorId(id);
        } catch (error) {
            throw new Error(`Error al actualizar rol: ${error.message}`);
        }
    }

static async eliminarRol(id) {
    try {
        if (!id) {
            throw new Error('ID de rol es requerido');
        }

        // Verificar que el rol existe
        const rolExistente = await Roles.obtenerPorId(id);
        if (!rolExistente) {
            throw new Error('Rol no encontrado');
        }

        // Roles que NO se pueden eliminar
        const rolesProtegidos = ['admin', 'empleado', 'cliente'];

        if (rolesProtegidos.includes(rolExistente.nombre.toLowerCase())) {
            throw new Error('No se puede eliminar un rol predefinido del sistema');
        }

        const eliminado = await Roles.eliminar(id);

        if (!eliminado) {
            throw new Error('No se pudo eliminar el rol');
        }

        return { mensaje: 'Rol eliminado correctamente' };

    } catch (error) {
        throw new Error(`Error al eliminar rol: ${error.message}`);
    }
}


    static async verificarUsoRol(id) {
        try {
            if (!id) {
                throw new Error('ID de rol es requerido');
            }

            // Verificar que el rol existe
            const rolExistente = await Roles.obtenerPorId(id);
            if (!rolExistente) {
                throw new Error('Rol no encontrado');
            }

            const estaEnUso = await Roles.verificarUso(id);
            return {
                enUso: estaEnUso,
                mensaje: estaEnUso ? 'El rol está siendo usado por uno o más usuarios' : 'El rol no está siendo usado'
            };
        } catch (error) {
            throw new Error(`Error al verificar uso del rol: ${error.message}`);
        }
    }

    static async obtenerRolesConEstadisticas() {
        try {
            return await Roles.obtenerRolesConConteoUsuarios();
        } catch (error) {
            throw new Error(`Error al obtener roles con estadísticas: ${error.message}`);
        }
    }

    static async obtenerRolesDisponibles() {
        try {
            const roles = await Roles.obtenerTodos();
            return roles.filter(rol => rol.activo !== 0); // Si tienes campo activo, sino retorna todos
        } catch (error) {
            throw new Error(`Error al obtener roles disponibles: ${error.message}`);
        }
    }
}

module.exports = RolesService;