const ordenItemsService = require('../services/OrdenItemsService.js');
const ordenesService = require('../services/OrdenesService.js');


class OrdenItemsController {
    static async crear(req, res) {
        try {            
            const nuevoItem = await ordenItemsService.crear(req.body);

            res.status(201).json({
                success: true,
                message: 'Item creado exitosamente',
                data: nuevoItem
            });
        } catch (error) {
            console.error("Error en crear:", error);
            res.status(500).json({ 
                success: false,
                message: 'Error al crear el item: ' + error.message 
            });
        }
    }

    static async obtenerTodos(req, res) {
        try {
            const items = await ordenItemsService.obtenerTodos();

            res.status(200).json({
                success: true,
                data: items,
                count: items.length
            });
        } catch (error) {
            console.error("Error en obtenerTodos:", error);
            res.status(500).json({ 
                success: false,
                message: 'Error al obtener todos los items: ' + error.message 
            });
        }
    }

    static async obtenerPorOrden(req, res) {
        try {
            const ordenId = req.params.ordenId;
            const items = await ordenItemsService.obtenerPorOrden(ordenId);

            res.status(200).json({
                success: true,
                data: items,
                count: items.length
            });
        } catch (error) {
            console.error("Error en obtenerPorOrden:", error);
            res.status(500).json({ 
                success: false,
                message: 'Error al obtener los items de la orden: ' + error.message 
            });
        }
    }

    static async actualizar(req, res) {
        try {
            const id = req.params.id;
            const actualizado = await ordenItemsService.actualizar(id, req.body);

            if (!actualizado) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Item no encontrado' 
                });
            }

            // ACTUALIZAR EL TOTAL DE LA ORDEN
            await ordenesService.actualizarTotal(actualizado.orden_id);

            res.status(200).json({ 
                success: true,
                message: 'Item actualizado exitosamente' 
            });
        } catch (error) {
            console.error("Error en actualizar:", error);
            res.status(500).json({ 
                success: false,
                message: 'Error al actualizar el item: ' + error.message 
            });
        }
    }

    static async eliminar(req, res) {
        try {
            const id = req.params.id;
            
            // Obtener el item antes de eliminarlo para saber la orden_id
            const itemAEliminar = await ordenItemsService.obtenerPorId(id);
            if (!itemAEliminar) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Item no encontrado' 
                });
            }
            
            const eliminado = await ordenItemsService.eliminar(id);

            if (!eliminado) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Item no encontrado' 
                });
            }

            // ACTUALIZAR EL TOTAL DE LA ORDEN
            await ordenesService.actualizarTotal(itemAEliminar.orden_id);

            res.status(200).json({ 
                success: true,
                message: 'Item eliminado exitosamente' 
            });
        } catch (error) {
            console.error("Error en eliminar:", error);
            res.status(500).json({ 
                success: false,
                message: 'Error al eliminar el item: ' + error.message 
            });
        }
    }
}

module.exports = OrdenItemsController;