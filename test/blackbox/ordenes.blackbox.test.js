const { expect } = require('chai');
const sinon = require('sinon');
const OrdenesController = require('../../controllers/OrdenesController');
const ordenesService = require('../../services/OrdenesService');
const ordenItemsService = require('../../services/OrdenItemsService');

describe('Pruebas Caja Negra: OrdenesController', () => {
    let req, res, statusStub, jsonSpy;

    beforeEach(() => {
        statusStub = sinon.stub();
        jsonSpy = sinon.spy();

        req = {
            body: {},
            params: {},
            usuario: {}
        };

        res = {
            status: statusStub.returns({ json: jsonSpy }),
            json: jsonSpy
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('GET /api/ordenes - obtenerTodos', () => {
        it('Debe responder 200 con lista de órdenes', async () => {
            const mockOrdenes = [
                { id: 1, numero_orden: 'ORD-001', total: 1000, estado: 'completado' },
                { id: 2, numero_orden: 'ORD-002', total: 500, estado: 'pendiente' }
            ];

            sinon.stub(ordenesService, 'obtenerTodos').resolves(mockOrdenes);

            await OrdenesController.obtenerTodos(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.args[0][0].data).to.be.an('array');
            expect(jsonSpy.args[0][0]).to.have.property('count', 2);
        });
    });

    describe('GET /api/ordenes/:id - obtenerPorId', () => {
        it('Debe responder 200 cuando la orden existe', async () => {
            req.params.id = '1';
            req.usuario = { id: 1, rol: 'admin' };

            const mockOrden = {
                id: 1,
                numero_orden: 'ORD-001',
                total: 1000,
                clienteId: 1
            };

            sinon.stub(ordenesService, 'obtenerPorId').resolves(mockOrden);

            await OrdenesController.obtenerPorId(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.args[0][0]).to.have.property('success', true);
        });

        it('Debe responder 404 cuando la orden no existe', async () => {
            req.params.id = '999';

            sinon.stub(ordenesService, 'obtenerPorId').resolves(null);

            await OrdenesController.obtenerPorId(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
            expect(jsonSpy.args[0][0]).to.have.property('message', 'Orden no encontrada');
        });

        it('Debe responder 403 cuando cliente intenta ver orden de otro', async () => {
            req.params.id = '1';
            req.usuario = { id: 2, rol: 'cliente' };

            const mockOrden = {
                id: 1,
                clienteId: 1
            };

            sinon.stub(ordenesService, 'obtenerPorId').resolves(mockOrden);

            await OrdenesController.obtenerPorId(req, res);

            expect(statusStub.calledWith(403)).to.be.true;
        });
    });

    describe('DELETE /api/ordenes/:id - eliminar', () => {
        it('Debe responder 200 cuando elimina exitosamente', async () => {
            req.params.id = '1';

            sinon.stub(ordenesService, 'eliminar').resolves(true);

            await OrdenesController.eliminar(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.args[0][0]).to.have.property('message', 'Orden eliminada exitosamente');
        });

        it('Debe responder 404 cuando la orden no existe', async () => {
            req.params.id = '999';

            sinon.stub(ordenesService, 'eliminar').resolves(false);

            await OrdenesController.eliminar(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
        });
    });

    describe('GET /api/ordenes/cliente/:clienteId - obtenerPorCliente', () => {
        it('Debe responder 200 con órdenes del cliente', async () => {
            req.params.clienteId = '1';

            const mockOrdenes = [
                { id: 1, cliente_id: 1, total: 500 },
                { id: 2, cliente_id: 1, total: 300 }
            ];

            sinon.stub(ordenesService, 'obtenerPorCliente').resolves(mockOrdenes);

            await OrdenesController.obtenerPorCliente(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.args[0][0].data).to.be.an('array');
            expect(jsonSpy.args[0][0]).to.have.property('count', 2);
        });
    });

    describe('GET /api/ordenes/numero/:numeroOrden - obtenerPorNumeroOrden', () => {
        it('Debe responder 200 cuando encuentra la orden', async () => {
            req.params.numeroOrden = 'ORD-001';
            req.usuario = { id: 1, rol: 'admin' };

            const mockOrdenes = [
                { id: 1, numero_orden: 'ORD-001', cliente_id: 1, total: 500 }
            ];

            sinon.stub(ordenesService, 'obtenerTodos').resolves(mockOrdenes);
            sinon.stub(ordenItemsService, 'obtenerPorOrden').resolves([]);

            await OrdenesController.obtenerPorNumeroOrden(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.args[0][0]).to.have.property('success', true);
        });

        it('Debe responder 404 cuando no encuentra la orden', async () => {
            req.params.numeroOrden = 'ORD-999';
            req.usuario = { id: 1, rol: 'admin' };

            sinon.stub(ordenesService, 'obtenerTodos').resolves([]);

            await OrdenesController.obtenerPorNumeroOrden(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
        });
    });
});
