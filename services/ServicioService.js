const Servicio = require('../models/Servicio');
const { CreateServicioDto, UpdateServicioDto } = require('../dto/ServicioDto');

class ServicioService {

    static async getAllServicios() {
        try {
            return await Servicio.findAll();
        } catch (error) {
            throw new Error(`Error al obtener servicios: ${error.message}`);
        }
    }


    static async getServiciosByTipo(tipo) {
        try {

            if (!['basico', 'avanzado'].includes(tipo)) {
                throw new Error('Tipo de servicio inválido. Use "basico" o "avanzado"');
            }
            return await Servicio.findByTipo(tipo);
        } catch (error) {
            throw new Error(`Error al obtener servicios por tipo: ${error.message}`);
        }
    }


    static async getServicioById(id) {
        try {
            const servicio = await Servicio.findById(id);
            if (!servicio) {
                throw new Error('Servicio no encontrado');
            }
            return servicio;
        } catch (error) {
            throw new Error(`Error al obtener servicio: ${error.message}`);
        }
    }


    async createServicio(servicioData) {
        try {
            const nuevoServicioDto = new CreateServicioDto(servicioData);
            const errors = nuevoServicioDto.validate();

            if (errors.length > 0) {
                throw new Error(`Errores de validación: ${errors.join(', ')}`);
            }

            const servicioModel = nuevoServicioDto.toModel();

            const servicioExistente = await Servicio.findByNombre(servicioModel.nombre);
            if (servicioExistente) {
                throw new Error('Ya existe un servicio con ese nombre');
            }

            return await Servicio.create(servicioModel);
        } catch (error) {
            throw new Error(`Error al crear servicio: ${error.message}`);
        }
    }


    static async updateServicio(id, servicioData) {
        try {
            const servicioExistente = await Servicio.findById(id);
            if (!servicioExistente) {
                throw new Error('Servicio no encontrado');
            }

            const updateDto = new UpdateServicioDto(servicioData);
            const errors = updateDto.validate();

            if (errors.length > 0) {
                throw new Error(`Errores de validación: ${errors.join(', ')}`);
            }

            const camposActualizar = updateDto.toPatchObject();

            if (Object.keys(camposActualizar).length === 0) {
                throw new Error('No se enviaron campos para actualizar');
            }

            // Validar nombre único si se está actualizando el nombre
            if (camposActualizar.nombre) {
                const servicioConMismoNombre = await Servicio.findByNombre(camposActualizar.nombre, id);
                if (servicioConMismoNombre) {
                    throw new Error('Ya existe otro servicio con ese nombre');
                }
            }

            const servicioCompleto = {
                ...servicioExistente,
                ...camposActualizar
            };

            return await Servicio.update(id, servicioCompleto);
        } catch (error) {
            throw new Error(`Error al actualizar servicio: ${error.message}`);
        }
    }


    static async deleteServicio(id) {
        try {
            const servicio = await Servicio.findById(id);
            if (!servicio) {
                throw new Error('Servicio no encontrado');
            }

            const eliminado = await Servicio.delete(id);
            if (!eliminado) {
                throw new Error('No se pudo eliminar el servicio');
            }

            return { message: 'Servicio eliminado correctamente' };
        } catch (error) {
            throw new Error(`Error al eliminar servicio: ${error.message}`);
        }
    }
}

module.exports = ServicioService;