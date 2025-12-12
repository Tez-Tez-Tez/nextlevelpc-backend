const { expect } = require('chai');
const sinon = require('sinon');
const OrdenesController = require('../../controllers/OrdenesController');
const OrdenesService = require('../../services/OrdenesService');
const OrdenItemsService = require('../../services/OrdenItemsService');

describe('Pruebas Funcionales: OrdenesController', () => {
    let req, res, statusStub, jsonSpy;

    // Configuración antes de cada prueba
    beforeEach(() => {
        req = {
            body: {},
            params: {},
            query: {},
            usuario: { id: 1, rol: 'admin' } // Por defecto usuario admin
        };

        statusStub = sinon.stub();
        jsonSpy = sinon.spy();
        
        res = {
            status: statusStub,
            json: jsonSpy
        };

        // Permitir encadenamiento res.status().json()
        statusStub.returns({ json: jsonSpy });
    });

    // Restaurar los stubs después de cada prueba
    afterEach(() => {
        sinon.restore();
    });

    /**
     * Prueba: Crear Orden
     */
    describe('crear', () => {
        it('Debe crear una orden exitosamente y retornar 201', async () => {
            req.body = {
                cliente_id: 5,
                tipo: 'producto',
                total: 100
            };

            const fakeId = 100;
            const fakeOrden = { 
                id: fakeId, 
                numero_orden: 'ORD-100', 
                ...req.body,
                created_at: new Date()
            };

            // El controlador llama a crear y luego obtiene la orden creada
            sinon.stub(OrdenesService, 'crear').resolves(fakeId);
            sinon.stub(OrdenesService, 'obtenerPorId').resolves(fakeOrden);

            await OrdenesController.crear(req, res);

            expect(statusStub.calledWith(201)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match({
                success: true,
                message: 'Orden creada exitosamente'
            }))).to.be.true;
        });

        it('Debe retornar 500 si falla el servicio', async () => {
            req.body = { cliente_id: 5, tipo: 'producto' };
            
            // Simular error en el servicio
            sinon.stub(OrdenesService, 'crear').rejects(new Error('Error de base de datos'));

            await OrdenesController.crear(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match({ success: false }))).to.be.true;
        });
    });

    /**
     * Prueba: Obtener Todas las Ordenes
     */
    describe('obtenerTodos', () => {
        it('Debe retornar la lista de órdenes y status 200', async () => {
            const mockOrdenes = [
                { id: 1, numero_orden: 'ORD-1', total: 100 },
                { id: 2, numero_orden: 'ORD-2', total: 200 }
            ];

            sinon.stub(OrdenesService, 'obtenerTodos').resolves(mockOrdenes);

            await OrdenesController.obtenerTodos(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match({
                success: true,
                count: 2
            }))).to.be.true;
        });
    });

    /**
     * Prueba: Obtener Orden por ID (con validación de permisos)
     */
    describe('obtenerPorId', () => {
        const mockOrden = { 
            id: 10, 
            numero_orden: 'ORD-10', 
            clienteId: 5, // Nota: El controlador usa clienteId (camelCase)
            total: 500 
        };

        it('Admin debe poder ver cualquier orden', async () => {
            req.usuario = { id: 1, rol: 'admin' };
            req.params.id = 10;

            sinon.stub(OrdenesService, 'obtenerPorId').resolves(mockOrden);

            await OrdenesController.obtenerPorId(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match({ success: true }))).to.be.true;
        });

        it('Cliente debe poder ver SU propia orden', async () => {
            req.usuario = { id: 5, rol: 'cliente' }; // ID coincide con clienteId de la orden
            req.params.id = 10;

            sinon.stub(OrdenesService, 'obtenerPorId').resolves(mockOrden);

            await OrdenesController.obtenerPorId(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
        });

        it('Cliente NO debe poder ver orden de otro (403)', async () => {
            req.usuario = { id: 99, rol: 'cliente' }; // ID diferente
            req.params.id = 10;

            sinon.stub(OrdenesService, 'obtenerPorId').resolves(mockOrden);

            await OrdenesController.obtenerPorId(req, res);

            expect(statusStub.calledWith(403)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match({ 
                mensaje: 'Solo puedes ver ordenes que son tuyas' 
            }))).to.be.true;
        });

        it('Debe retornar 404 si la orden no existe', async () => {
            req.params.id = 999;
            sinon.stub(OrdenesService, 'obtenerPorId').resolves(null);

            await OrdenesController.obtenerPorId(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
        });
    });

    /**
     * Prueba: Actualizar Orden
     */
    describe('actualizar', () => {
        it('Debe actualizar y retornar 200', async () => {
            req.params.id = 1;
            req.body = { estado_orden: 'completada' };

            // Servicio retorna la orden actualizada o true
            sinon.stub(OrdenesService, 'actualizar').resolves({ id: 1, estado_orden: 'completada' });

            await OrdenesController.actualizar(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match({
                success: true,
                message: 'Orden actualizada exitosamente'
            }))).to.be.true;
        });

        it('Debe retornar 404 si el servicio indica que no encontró la orden', async () => {
            req.params.id = 999;
            req.body = { estado_orden: 'completada' };
            
            // Simular que el servicio devuelve null/false
            sinon.stub(OrdenesService, 'actualizar').resolves(null);

            await OrdenesController.actualizar(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
        });
    });

    /**
     * Prueba: Eliminar Orden
     */
    describe('eliminar', () => {
        it('Debe eliminar y retornar 200', async () => {
            req.params.id = 1;
            sinon.stub(OrdenesService, 'eliminar').resolves(true);

            await OrdenesController.eliminar(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match({
                success: true,
                message: 'Orden eliminada exitosamente'
            }))).to.be.true;
        });
    });

    /**
     * Prueba: Obtener por Número de Orden
     * Nota: Este método usa tanto OrdenesService como OrdenItemsService
     */
    describe('obtenerPorNumeroOrden', () => {
        it('Debe buscar la orden, verificar permisos y traer sus items', async () => {
            req.params.numeroOrden = 'ORD-2025';
            req.usuario = { id: 1, rol: 'admin' };

            const mockOrden = { 
                id: 50, 
                numero_orden: 'ORD-2025', 
                cliente_id: 10 // snake_case aquí porque viene de obtenerTodos (DB raw)
            };
            
            const mockItems = [
                { id: 1, producto: 'PC Gamer' },
                { id: 2, producto: 'Mouse' }
            ];

            // 1. Mock de obtenerTodos (el controlador busca en la lista)
            sinon.stub(OrdenesService, 'obtenerTodos').resolves([mockOrden]);
            
            // 2. Mock de obtener items
            sinon.stub(OrdenItemsService, 'obtenerPorOrden').resolves(mockItems);

            await OrdenesController.obtenerPorNumeroOrden(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            // Verificar que la respuesta combina datos de la orden y los items
            expect(jsonSpy.calledWith(sinon.match({
                success: true,
                data: sinon.match.has('items')
            }))).to.be.true;
        });

        it('Debe retornar 404 si el número de orden no existe', async () => {
            req.params.numeroOrden = 'INEXISTENTE';
            
            // Retorna lista vacía o lista sin esa orden
            sinon.stub(OrdenesService, 'obtenerTodos').resolves([{ numero_orden: 'OTRA' }]);

            await OrdenesController.obtenerPorNumeroOrden(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
        });

        it('Debe retornar 403 si el usuario intenta ver una orden ajena por número', async () => {
            req.params.numeroOrden = 'ORD-SECRET';
            req.usuario = { id: 5, rol: 'cliente' }; // Usuario ID 5

            const mockOrden = { 
                id: 50, 
                numero_orden: 'ORD-SECRET', 
                cliente_id: 99 // Orden de ID 99
            };

            sinon.stub(OrdenesService, 'obtenerTodos').resolves([mockOrden]);

            await OrdenesController.obtenerPorNumeroOrden(req, res);

            expect(statusStub.calledWith(403)).to.be.true;
        });
    });

    /**
     * Prueba: Obtener por Cliente
     */
    describe('obtenerPorCliente', () => {
        it('Debe retornar las órdenes de un cliente específico', async () => {
            req.params.clienteId = 5;
            const mockOrdenes = [{ id: 1, cliente_id: 5 }];

            sinon.stub(OrdenesService, 'obtenerPorCliente').resolves(mockOrdenes);

            await OrdenesController.obtenerPorCliente(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match({
                success: true,
                count: 1
            }))).to.be.true;
        });
    });
});