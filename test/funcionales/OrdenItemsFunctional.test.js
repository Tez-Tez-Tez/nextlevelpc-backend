const { expect } = require('chai');
const sinon = require('sinon');
const OrdenItemsController = require('../../controllers/OrdenItemsController');
const OrdenItemsService = require('../../services/OrdenItemsService');
const OrdenesService = require('../../services/OrdenesService');

describe('Pruebas Funcionales: OrdenItemsController', () => {
    let req, res, statusStub, jsonSpy;

    // Configuración antes de cada prueba
    beforeEach(() => {
        // Simulamos req y res
        req = {
            body: {},
            params: {}
        };

        statusStub = sinon.stub();
        jsonSpy = sinon.spy();
        
        res = {
            status: statusStub,
            json: jsonSpy
        };

        statusStub.returns({ json: jsonSpy });
    });

    // Restaurar los stubs después de cada prueba
    afterEach(() => {
        sinon.restore();
    });

    /**
     * Prueba: Crear Item de Orden
     */
    describe('crear', () => {
        it('Debe retornar status 201 y el item creado exitosamente', async () => {
            req.body = { 
                orden_id: 1, 
                producto_id: 5, 
                cantidad: 2, 
                precio_unitario: 100 
            };
            
            const mockItemResponse = { 
                id: 10, 
                ...req.body, 
                subtotal: 200 
            };

            // Simulamos el servicio
            sinon.stub(OrdenItemsService, 'crear').resolves(mockItemResponse);

            await OrdenItemsController.crear(req, res);

            expect(statusStub.calledWith(201)).to.be.true;
            expect(jsonSpy.calledWith({
                success: true,
                message: 'Item creado exitosamente',
                data: mockItemResponse
            })).to.be.true;
        });

        it('Debe retornar status 500 si falla la creación', async () => {
            req.body = { orden_id: 1 };
            const errorMsg = 'Error de validación';

            sinon.stub(OrdenItemsService, 'crear').rejects(new Error(errorMsg));

            await OrdenItemsController.crear(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match.has('message'))).to.be.true;
        });
    });

    /**
     * Prueba: Obtener Todos
     */
    describe('obtenerTodos', () => {
        it('Debe retornar status 200 y la lista de items', async () => {
            const mockItems = [{ id: 1 }, { id: 2 }];
            
            sinon.stub(OrdenItemsService, 'obtenerTodos').resolves(mockItems);

            await OrdenItemsController.obtenerTodos(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match({
                success: true,
                data: mockItems,
                count: 2
            }))).to.be.true;
        });
    });

    /**
     * Prueba: Obtener Por Orden
     */
    describe('obtenerPorOrden', () => {
        it('Debe retornar status 200 y los items de la orden específica', async () => {
            req.params.ordenId = 50;
            const mockItems = [{ id: 1, orden_id: 50 }];

            sinon.stub(OrdenItemsService, 'obtenerPorOrden').resolves(mockItems);

            await OrdenItemsController.obtenerPorOrden(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match({
                success: true,
                data: mockItems
            }))).to.be.true;
        });
    });

    /**
     * Prueba: Actualizar Item
     * NOTA: Este método en el controlador también llama a OrdenesService.actualizarTotal
     */
    describe('actualizar', () => {
        it('Debe actualizar el item, recalcular el total de la orden y retornar 200', async () => {
            req.params.id = 1;
            req.body = { cantidad: 5 };
            
            const mockItemActualizado = { 
                id: 1, 
                orden_id: 100, // Necesario para la llamada a OrdenesService
                cantidad: 5 
            };

            // 1. Mockear la actualización del item
            sinon.stub(OrdenItemsService, 'actualizar').resolves(mockItemActualizado);
            
            // 2. Mockear la actualización del total de la orden (importante porque el controlador lo llama explícitamente)
            const ordenesServiceStub = sinon.stub(OrdenesService, 'actualizarTotal').resolves(true);

            await OrdenItemsController.actualizar(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.calledWith({ 
                success: true,
                message: 'Item actualizado exitosamente' 
            })).to.be.true;
            
            // Verificar que se llamó a actualizarTotal con el ID correcto
            expect(ordenesServiceStub.calledWith(100)).to.be.true;
        });

        it('Debe retornar 404 si el item no existe al intentar actualizar', async () => {
            req.params.id = 999;
            
            // Simular que retorna null o false
            sinon.stub(OrdenItemsService, 'actualizar').resolves(null);

            await OrdenItemsController.actualizar(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match({ message: 'Item no encontrado' }))).to.be.true;
        });
    });

    /**
     * Prueba: Eliminar Item
     * NOTA: El controlador busca el item primero, luego lo elimina, y finalmente actualiza el total.
     */
    describe('eliminar', () => {
        it('Debe eliminar el item, actualizar el total y retornar 200', async () => {
            req.params.id = 1;
            
            const mockItem = { id: 1, orden_id: 55 };

            // 1. Mockear la búsqueda del item (para obtener orden_id)
            sinon.stub(OrdenItemsService, 'obtenerPorId').resolves(mockItem);
            
            // 2. Mockear la eliminación
            sinon.stub(OrdenItemsService, 'eliminar').resolves(true);
            
            // 3. Mockear la actualización del total de la orden
            const ordenesServiceStub = sinon.stub(OrdenesService, 'actualizarTotal').resolves(true);

            await OrdenItemsController.eliminar(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.calledWith({ 
                success: true,
                message: 'Item eliminado exitosamente' 
            })).to.be.true;

            // Verificar flujo
            expect(ordenesServiceStub.calledWith(55)).to.be.true;
        });

        it('Debe retornar 404 si el item a eliminar no existe (en la búsqueda inicial)', async () => {
            req.params.id = 999;

            // Falla al buscar ID
            sinon.stub(OrdenItemsService, 'obtenerPorId').resolves(null);

            await OrdenItemsController.eliminar(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
        });
        
        it('Debe retornar 404 si falla la eliminación en sí misma', async () => {
            req.params.id = 1;
            const mockItem = { id: 1, orden_id: 55 };

            sinon.stub(OrdenItemsService, 'obtenerPorId').resolves(mockItem);
            // Falla al eliminar
            sinon.stub(OrdenItemsService, 'eliminar').resolves(false);

            await OrdenItemsController.eliminar(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
        });
    });
});