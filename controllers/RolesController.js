const RolesService = require('../services/RolesService');

class RolesController {
    static async crearRol(req, res) {
        try {
            const { nombre } = req.body;

            if (!nombre) {
                return res.status(400).json({
                    success: false,
                    message: 'El campo nombre es obligatorio'
                });
            }

            const rolData = { nombre };
            const nuevoRol = await RolesService.crearRol(rolData);

            res.status(201).json({
                success: true,
                message: 'Rol creado exitosamente',
                data: nuevoRol
            });
        } catch (error) {
            if (error.message.includes('Ya existe un rol con ese nombre')) {
                return res.status(409).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    static async obtenerTodosLosRoles(req, res) {
        try {
            const roles = await RolesService.obtenerTodosLosRoles();

            res.status(200).json({
                success: true,
                data: roles
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async obtenerRolPorId(req, res) {
        try {
            const { id } = req.params;
            const rol = await RolesService.obtenerRolPorId(id);

            res.status(200).json({
                success: true,
                data: rol
            });
        } catch (error) {
            if (error.message === 'Rol no encontrado') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async obtenerRolPorNombre(req, res) {
        try {
            const { nombre } = req.params;
            const rol = await RolesService.obtenerRolPorNombre(nombre);

            res.status(200).json({
                success: true,
                data: rol
            });
        } catch (error) {
            if (error.message === 'Rol no encontrado') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    static async actualizarRol(req, res) {
        try {
            const { id } = req.params;
            const { nombre } = req.body;

            if (!nombre) {
                return res.status(400).json({
                    success: false,
                    message: 'El campo nombre es obligatorio'
                });
            }

            const rolData = { nombre };
            const rolActualizado = await RolesService.actualizarRol(id, rolData);

            res.status(200).json({
                success: true,
                message: 'Rol actualizado exitosamente',
                data: rolActualizado
            });
        } catch (error) {
            if (error.message === 'Rol no encontrado') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            if (error.message.includes('Ya existe otro rol con ese nombre')) {
                return res.status(409).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    static async eliminarRol(req, res) {
        try {
            const { id } = req.params;

            const resultado = await RolesService.eliminarRol(id);

            res.status(200).json({
                success: true,
                message: resultado.mensaje
            });
        } catch (error) {
            if (error.message === 'Rol no encontrado') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            if (error.message.includes('No se puede eliminar') || error.message.includes('está siendo usado')) {
                return res.status(409).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async verificarUsoRol(req, res) {
        try {
            const { id } = req.params;

            const resultado = await RolesService.verificarUsoRol(id);

            res.status(200).json({
                success: true,
                data: resultado
            });
        } catch (error) {
            if (error.message === 'Rol no encontrado') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async obtenerRolesConEstadisticas(req, res) {
        try {
            const roles = await RolesService.obtenerRolesConEstadisticas();

            res.status(200).json({
                success: true,
                data: roles
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async obtenerRolesDisponibles(req, res) {
        try {
            const roles = await RolesService.obtenerRolesDisponibles();

            res.status(200).json({
                success: true,
                data: roles
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = RolesController;