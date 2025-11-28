const Ordenes = require('../models/Ordenes');
const OrdenItems = require('../models/OrdenItems');

class OrdenesService {
    static async crear(ordenDTO) {
        try {
            const ordenData = ordenDTO.toModel ? ordenDTO.toModel() : ordenDTO;
            return await Ordenes.crear(ordenData);
        } catch (error) {
            throw new Error('Error al crear la orden: ' + error.message);
        }
    }

    static async obtenerTodos() {
        try {
            return await Ordenes.obtenerTodos();
        } catch (error) {
            throw new Error('Error al obtener órdenes: ' + error.message);
        }
    }

    static async obtenerPorId(id) {
        try {
            if (!id) {
                throw new Error('ID de orden es requerido');
            }

            const orden = await Ordenes.obtenerPorId(id);
            if (!orden) {
                throw new Error('Orden no encontrada');
            }

            // Obtener los items pagados de la orden
            const items = await OrdenItems.obtenerPorOrden(id);
            orden.items = items;

            return orden;
        } catch (error) {
            throw new Error('Error al obtener orden: ' + error.message);
        }
    }

    static async actualizar(id, ordenDTO) {
        try {
            if (!id) {
                throw new Error('ID de orden es requerido');
            }

            const ordenExistente = await Ordenes.obtenerPorId(id);
            if (!ordenExistente) {
                throw new Error('Orden no encontrada');
            }

            const ordenData = ordenDTO.toPatchObject ? ordenDTO.toPatchObject() : ordenDTO;
            return await Ordenes.actualizar(id, ordenData);
        } catch (error) {
            throw new Error('Error al actualizar orden: ' + error.message);
        }
    }

    static async eliminar(id) {
        try {
            if (!id) {
                throw new Error('ID de orden es requerido');
            }

            const ordenExistente = await Ordenes.obtenerPorId(id);
            if (!ordenExistente) {
                throw new Error('Orden no encontrada');
            }

            return await Ordenes.eliminar(id);
        } catch (error) {
            throw new Error('Error al eliminar orden: ' + error.message);
        }
    }

    static async obtenerPorCliente(clienteId) {
        try {
            if (!clienteId) {
                throw new Error('ID de cliente es requerido');
            }

            return await Ordenes.obtenerPorCliente(clienteId);
        } catch (error) {
            throw new Error('Error al obtener órdenes del cliente: ' + error.message);
        }
    }

    // NUEVO MÉTODO PARA ACTUALIZAR TOTAL
    static async actualizarTotal(ordenId) {
        try {
            if (!ordenId) {
                throw new Error('ID de orden es requerido');
            }

            const items = await OrdenItems.obtenerPorOrden(ordenId);
            const total = items.reduce((sum, item) => {
                return sum + (parseFloat(item.subtotal) || 0);
            }, 0);

            await Ordenes.actualizar(ordenId, { total: total.toFixed(2) });
            return total;
        } catch (error) {
            throw new Error('Error al actualizar total: ' + error.message);
        }
    }
}

module.exports = OrdenesService;