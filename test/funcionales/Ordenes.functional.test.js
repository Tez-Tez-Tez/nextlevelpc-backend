const { expect } = require('chai');
const sinon = require('sinon');

const OrdenesController = require('../../controllers/OrdenesController');
const OrdenesService = require('../../services/OrdenesService');
const OrdenItemsService = require('../../services/OrdenItemsService');

describe('Pruebas Funcionales: Ordenes', () => {
    let req, res, statusStub, jsonSpy;

    beforeEach(() => {
        statusStub = sinon.stub();
        jsonSpy = sinon.spy();

        req = {
            body: {},
            params: {},
            query: {},
            usuario: { id: 1, rol: 'admin' }
        };

        res = {
            status: statusStub.returns({ json: jsonSpy }),
            json: jsonSpy
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('Flujo Completo de Órdenes', () => {
        it('Crear Orden: Debe crear una orden vacía correctamente', async () => {
            req.body = {
                cliente_id: 5,
                tipo: 'producto',
                total: 0
            };

            const ordenId = 100;
            const ordenCreada = {
                id: ordenId,
                ...req.body,
                numero_orden: 'ORD-2025-100',
                estado_orden: 'pendiente',
                created_at: new Date()
            };

            sinon.stub(OrdenesService, 'crear').resolves(ordenId);
            sinon.stub(OrdenesService, 'obtenerPorId').resolves(ordenCreada);

            await OrdenesController.crear(req, res);

            expect(statusStub.calledWith(201)).to.be.true;
            expect(jsonSpy.args[0][0]).to.have.property('success', true);
            expect(jsonSpy.args[0][0].data).to.have.property('numero_orden');
        });

        it('Obtener Orden por ID: Admin puede ver cualquier orden', async () => {
            req.params.id = 50;
            req.usuario = { id: 1, rol: 'admin' };

            const mockOrden = {
                id: 50,
                clienteId: 10,
                total: 500,
                items: []
            };

            sinon.stub(OrdenesService, 'obtenerPorId').resolves(mockOrden);

            await OrdenesController.obtenerPorId(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
        });

        it('Obtener Orden por ID: Cliente solo puede ver sus propias órdenes', async () => {
            req.params.id = 50;
            req.usuario = { id: 5, rol: 'cliente' }; // Cliente ID 5

            const mockOrden = {
                id: 50,
                clienteId: 10, // Orden de otro cliente
                total: 500
            };

            sinon.stub(OrdenesService, 'obtenerPorId').resolves(mockOrden);

            await OrdenesController.obtenerPorId(req, res);

            expect(statusStub.calledWith(403)).to.be.true;
            expect(jsonSpy.args[0][0].mensaje).to.include('Solo puedes ver ordenes que son tuyas');
        });

        it('Obtener Orden por ID: Cliente puede ver su propia orden', async () => {
            req.params.id = 50;
            req.usuario = { id: 10, rol: 'cliente' }; // Cliente ID 10

            const mockOrden = {
                id: 50,
                clienteId: 10, // Su propia orden
                total: 500
            };

            sinon.stub(OrdenesService, 'obtenerPorId').resolves(mockOrden);

            await OrdenesController.obtenerPorId(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
        });

        it('Obtener Orden por ID: Debe retornar 404 si no existe', async () => {
            req.params.id = 999;
            sinon.stub(OrdenesService, 'obtenerPorId').resolves(null);

            await OrdenesController.obtenerPorId(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
        });

        it('Buscar por Número de Orden: Debe retornar la orden con sus items', async () => {
            req.params.numeroOrden = 'ORD-2025-100';

            const mockOrdenes = [{
                id: 100,
                numero_orden: 'ORD-2025-100',
                cliente_id: 5
            }];

            const mockItems = [
                { id: 1, descripcion: 'Mouse Gamer', cantidad: 1, precio: 50 },
                { id: 2, descripcion: 'Teclado Mecánico', cantidad: 1, precio: 120 }
            ];

            sinon.stub(OrdenesService, 'obtenerTodos').resolves(mockOrdenes);
            sinon.stub(OrdenItemsService, 'obtenerPorOrden').resolves(mockItems);

            await OrdenesController.obtenerPorNumeroOrden(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.args[0][0].data).to.have.property('items');
            expect(jsonSpy.args[0][0].data.items).to.have.lengthOf(2);
        });

        it('Actualizar Estado de Orden: Debe cambiar el estado correctamente', async () => {
            req.params.id = 100;
            req.body = { estado_orden: 'completada' };

            sinon.stub(OrdenesService, 'actualizar').resolves(true);

            await OrdenesController.actualizar(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.args[0][0]).to.have.property('success', true);
        });

        it('Eliminar Orden: Debe eliminar correctamente', async () => {
            req.params.id = 100;
            sinon.stub(OrdenesService, 'eliminar').resolves(true);

            await OrdenesController.eliminar(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
        });
    });

    describe('Validaciones de Permisos', () => {
        it('No debe permitir crear orden sin cliente_id', async () => {
            req.body = { tipo: 'producto', total: 0 }; // Falta cliente_id

            await OrdenesController.crear(req, res);

            expect(statusStub.calledWith(400)).to.be.true;
        });
    });
});
