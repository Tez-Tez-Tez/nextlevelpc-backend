const CitaServicio = require('../models/CitaServicio');

class CitaServicioService {
    static async createCita(citaData) {
        // Aquí se podrían añadir validaciones de negocio
        if (!citaData.email) {
            throw new Error('El correo electrónico es obligatorio.');
        }
        // ... más validaciones

        return await CitaServicio.create(citaData);
    }

    // Alias para mantener consistencia con otros servicios
    static async crear(citaData) {
        return await this.createCita(citaData);
    }

    static async getAllCitas() {
        return await CitaServicio.findAll();
    }

    static async updateCitaStatus(id, estado) {
        const estadosValidos = ['pendiente', 'confirmada', 'cancelada', 'completada'];
        if (!estadosValidos.includes(estado)) {
            throw new Error('Estado no válido.');
        }
        return await CitaServicio.updateStatus(id, estado);
    }

    // NUEVO: Obtener cita por ID
    static async obtenerPorId(id) {
        if (!id) {
            throw new Error('El ID de la cita es requerido.');
        }
        return await CitaServicio.findById(id);
    }

    // NUEVO: Actualizar estado de pago de una cita
    static async actualizarEstadoPago(id, estadoPago, ordenId = null) {
        const estadosValidos = ['pendiente', 'pagado', 'cancelado'];
        if (!estadosValidos.includes(estadoPago)) {
            throw new Error('Estado de pago no válido.');
        }

        return await CitaServicio.updateEstadoPago(id, estadoPago, ordenId);
    }

    static async actualizar(id,data){
        if(!id){
            throw new Error('El ID de la cita es requerido')
        }
        return await CitaServicio.actualizar(id,data)
    }

    static async deleteCita(id) {
        if (!id) {
            throw new Error('El ID de la cita es requerido.');
        }
        return await CitaServicio.delete(id);
    }
}

module.exports = CitaServicioService;

