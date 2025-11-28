const ordenesService = require('../services/OrdenesService.js');
const ordenItemsService = require('../services/OrdenItemsService.js');
const { OrdenCreateDTO, OrdenUpdateDTO, OrdenResponseDTO } = require('../dto/OrdenesDTO');

// Necesitarás estos servicios - asegúrate de que existan
const UsuariosService = require('../services/UsuariosService.js');
const ProductosService = require('../services/ProductosService.js');

class OrdenController {

    // MÉTODOS EXISTENTES (API) - NO CAMBIAN

    static async crear(req, res) {
        try {
            console.log('=== CREANDO ORDEN ===');

            const ordenDTO = new OrdenCreateDTO(req.body);
            const errors = ordenDTO.validate();

            if (errors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Errores de validación',
                    errors: errors
                });
            }

            console.log('DTO válido, creando orden...');
            const insertId = await ordenesService.crear(ordenDTO);
            const nuevaOrden = await ordenesService.obtenerPorId(insertId);

            const ordenResponse = new OrdenResponseDTO(nuevaOrden);

            console.log('ORDEN CREADA EXITOSAMENTE');
            console.log('Orden:', ordenResponse.toSummary());

            res.status(201).json({
                success: true,
                message: 'Orden creada exitosamente',
                data: ordenResponse.toDetail()
            });

        } catch (error) {
            console.error('Error en crear:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear la orden: ' + error.message
            });
        }
    }

    static async obtenerTodos(req, res) {
        try {
            const ordenes = await ordenesService.obtenerTodos();

            const ordenesResponse = ordenes.map(orden =>
                new OrdenResponseDTO(orden).toSummary()
            );

            res.status(200).json({
                success: true,
                data: ordenesResponse,
                count: ordenesResponse.length
            });
        } catch (error) {
            console.error("Error en obtenerTodos:", error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener las órdenes: ' + error.message
            });
        }
    }

    static async obtenerPorId(req, res) {
        try {
            const id = req.params.id;
            const orden = await ordenesService.obtenerPorId(id);

            if (!orden) {
                return res.status(404).json({
                    success: false,
                    message: 'Orden no encontrada'
                });
            }

            // Validar permisos solo si hay usuario autenticado
            if (req.usuario) {
                if (!['admin', 'empleado'].includes(req.usuario.rol) && req.usuario.id !== parseInt(orden.clienteId)) {
                    return res.status(403).json({
                        success: false,
                        mensaje: 'Solo puedes ver ordenes que son tuyas'
                    });
                }
            }
            // Si no hay usuario autenticado, permitir acceso (para facturas post-pago)

            const ordenResponse = new OrdenResponseDTO(orden);

            res.status(200).json({
                success: true,
                data: ordenResponse.toDetail()
            });
        } catch (error) {
            console.error("Error en obtenerPorId:", error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener la orden: ' + error.message
            });
        }
    }

    static async actualizar(req, res) {
        try {
            const id = req.params.id;
            const ordenDTO = new OrdenUpdateDTO(req.body);
            const errors = ordenDTO.validate();

            if (errors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Errores de validación',
                    errors: errors
                });
            }

            const actualizado = await ordenesService.actualizar(id, ordenDTO);

            if (!actualizado) {
                return res.status(404).json({
                    success: false,
                    message: 'Orden no encontrada'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Orden actualizada exitosamente'
            });
        } catch (error) {
            console.error("Error en actualizar:", error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar la orden: ' + error.message
            });
        }
    }

    static async eliminar(req, res) {
        try {
            const id = req.params.id;
            const eliminado = await ordenesService.eliminar(id);

            if (!eliminado) {
                return res.status(404).json({
                    success: false,
                    message: 'Orden no encontrada'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Orden eliminada exitosamente'
            });
        } catch (error) {
            console.error("Error en eliminar:", error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar la orden: ' + error.message
            });
        }
    }

    static async obtenerPorCliente(req, res) {
        try {
            const clienteId = req.params.clienteId;
            const ordenes = await ordenesService.obtenerPorCliente(clienteId);

            const ordenesResponse = ordenes.map(orden =>
                new OrdenResponseDTO(orden).toSummary()
            );

            res.status(200).json({
                success: true,
                data: ordenesResponse,
                count: ordenesResponse.length
            });
        } catch (error) {
            console.error("Error en obtenerPorCliente:", error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener las órdenes del cliente: ' + error.message
            });
        }
    }

    static async obtenerPorNumeroOrden(req, res) {
        try {
            const { numeroOrden } = req.params;

            // Buscar la orden por número
            const ordenes = await ordenesService.obtenerTodos();
            const orden = ordenes.find(o => o.numero_orden === numeroOrden);

            if (!orden) {
                return res.status(404).json({
                    success: false,
                    message: 'Orden no encontrada'
                });
            }

            // Verificar permisos
            if (!['admin', 'empleado'].includes(req.usuario.rol) &&
                req.usuario.id !== parseInt(orden.cliente_id)) {
                return res.status(403).json({
                    success: false,
                    mensaje: 'No tienes permiso para ver esta orden'
                });
            }

            // Obtener items de la orden
            const items = await ordenItemsService.obtenerPorOrden(orden.id);

            const ordenResponse = new OrdenResponseDTO(orden);

            res.status(200).json({
                success: true,
                data: {
                    ...ordenResponse.toDetail(),
                    items: items
                }
            });
        } catch (error) {
            console.error("Error en obtenerPorNumeroOrden:", error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener la orden: ' + error.message
            });
        }
    }
}

module.exports = OrdenController;