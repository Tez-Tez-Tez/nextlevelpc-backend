const OrdenItems = require('../models/OrdenItems');
const { OrdenItemCreateDTO, OrdenItemUpdateDTO, OrdenItemResponseDTO } = require('../dto/OrdenItemsDTO');
const OrdenesService = require('./OrdenesService')

class OrdenItemsService {
    static async crear(item) {
        try {
            const itemDTO = new OrdenItemCreateDTO(item);
            const errors = itemDTO.validate();
            if(errors.length>0){
                throw new Error('Errores al crear orden-item: '+ JSON.stringify(errors))
            }
            // ACTUALIZAR EL TOTAL DE LA ORDEN
            await OrdenesService.actualizarTotal(itemDTO.orden_id);
            const itemData = itemDTO.toModel();
            console.log('Datos para BD:', itemData);
            
            const insertId = await OrdenItems.crear(itemData);
            console.log('Item creado con ID:', insertId);
            
            // Obtener el item completo con created_at
            const result = await OrdenItems.obtenerPorId(insertId);

            if (!result) {
                throw new Error('No se pudo obtener el item recién creado');
            }
            
            console.log('Item obtenido:', result);

            const itemResponse = new OrdenItemResponseDTO(result);
            return itemResponse;
            
        } catch (error) {
            console.error('Error en servicio:', error);
            throw new Error('Error al crear el item: ' + error.message);
        }
    }

    static async obtenerTodos() {
        try {
        const items = await OrdenItems.obtenerTodos();
        const itemsResponse = items.map(item => 
        new OrdenItemResponseDTO(item));
        return itemsResponse;
        } catch (error) {
            throw new Error('Error al obtener items: ' + error.message);
        }
    }

    static async obtenerPorOrden(ordenId) {
        try {
            if (!ordenId) {
                throw new Error('ID de orden es requerido');
            }

        const items= await OrdenItems.obtenerPorOrden(ordenId);
        const itemsResponse = items.map(item => 
        new OrdenItemResponseDTO(item)
        );
        return itemsResponse;
        } catch (error) {
            throw new Error('Error al obtener items de la orden: ' + error.message);
        }
    }

    static async actualizar(id, itemDTO) {
        try {
            if (!id) {
                throw new Error('ID de item es requerido');
            }

            // Verificar que el item existe
            const itemExistente = await OrdenItemsService.obtenerPorId(id);
            if (!itemExistente) {
                throw new Error('Item no encontrado');
            }
            
            const item = new OrdenItemUpdateDTO(itemDTO);
            const errors = item.validate();

            if(errors.length > 0){
            throw new Error('Errores al actualizar el item: ' + JSON.stringify(errors))
            }

            const itemData = item.toPatchObject();
            return await OrdenItems.actualizar(id, itemData);
        } catch (error) {
            throw new Error('Error al actualizar item: ' + error.message);
        }
    }

    static async eliminar(id) {
        try {
            if (!id) {
                throw new Error('ID de item es requerido');
            }

            // Verificar que el item existe
            const itemExistente = await OrdenItemsService.obtenerPorId(id);
            if (!itemExistente) {
                throw new Error('Item no encontrado');
            }

            return await OrdenItems.eliminar(id);
        } catch (error) {
            throw new Error('Error al eliminar item: ' + error.message);
        }
    }

    static async eliminarPorOrden(ordenId) {
        try {
            if (!ordenId) {
                throw new Error('ID de orden es requerido');
            }

            return await OrdenItems.eliminarPorOrden(ordenId);
        } catch (error) {
            throw new Error('Error al eliminar items de la orden: ' + error.message);
        }
    }

    static async obtenerPorId(id) {
        try {
            if (!id) {
                throw new Error('ID de item es requerido');
            }

            const result = await OrdenItems.obtenerPorId(id);
            
            if (!result) {
                throw new Error('Item no encontrado');
            }

            return result;
        } catch (error) {
            throw new Error('Error al obtener item por ID: ' + error.message);
        }
    }
}

module.exports = OrdenItemsService;