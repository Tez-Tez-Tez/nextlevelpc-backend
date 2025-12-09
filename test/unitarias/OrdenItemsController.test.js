const { expect } = require('chai');
const sinon = require('sinon');

const OrdenItemsController = require('../../controllers/OrdenItemsController');
const OrdenItemsService = require('../../services/OrdenItemsService');
const OrdenesService = require('../../services/OrdenesService');

describe('Pruebas Unitarias: OrdenItemsController', () => {
    let req, res, statusStub, jsonSpy;

    beforeEach(() => {
        statusStub = sinon.stub();
        jsonSpy = sinon.spy();
        
        req = {
            body: {},
            params: {}
        };
        
        res = {
            status: statusStub.returns({ json: jsonSpy }),
            json: jsonSpy
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('crear', () => {
        it('Debe responder 201 al crear item', async () => {
            req.body = { descripcion: 'Nuevo Item' };
            const itemCreado = { id: 1, ...req.body };

            sinon.stub(OrdenItemsService, 'crear').resolves(itemCreado);

            await OrdenItemsController.crear(req, res);

            expect(statusStub.calledWith(201)).to.be.true;
            expect(jsonSpy.args[0][0].data).to.deep.equal(itemCreado);
        });

        it('Debe responder 500 si falla el servicio', async () => {
            sinon.stub(OrdenItemsService, 'crear').rejects(new Error('Error al crear'));

            await OrdenItemsController.crear(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
        });
    });

    describe('obtenerPorOrden', () => {
        it('Debe responder 200 con la lista de items', async () => {
            req.params.ordenId = 10;
            const lista = [{ id: 1, descripcion: 'Item A' }];

            sinon.stub(OrdenItemsService, 'obtenerPorOrden').resolves(lista);

            await OrdenItemsController.obtenerPorOrden(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.args[0][0].data).to.deep.equal(lista);
        });
    });

    describe('actualizar', () => {
        it('Debe actualizar item y recalcular orden (Status 200)', async () => {
            req.params.id = 1;
            req.body = { cantidad: 5 };
            
            const itemActualizado = { id: 1, orden_id: 50, cantidad: 5 };

            // 1. Stub: Servicio retorna el item actualizado
            sinon.stub(OrdenItemsService, 'actualizar').resolves(itemActualizado);
            
            // 2. Stub: Controlador llama a OrdenesService para recalcular
            sinon.stub(OrdenesService, 'actualizarTotal').resolves(true);

            await OrdenItemsController.actualizar(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(OrdenesService.actualizarTotal.calledWith(50)).to.be.true; // Se recalculó la orden 50
        });

        it('Debe responder 404 si el item no existe (servicio devuelve null)', async () => {
            req.params.id = 999;
            sinon.stub(OrdenItemsService, 'actualizar').resolves(null);

            await OrdenItemsController.actualizar(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
        });
    });

    describe('eliminar', () => {
        it('Debe eliminar item y recalcular orden (Status 200)', async () => {
            req.params.id = 1;
            const itemAEliminar = { id: 1, orden_id: 50 };

            // 1. Stub: Controlador busca el item antes de borrar
            sinon.stub(OrdenItemsService, 'obtenerPorId').resolves(itemAEliminar);
            
            // 2. Stub: Eliminar
            sinon.stub(OrdenItemsService, 'eliminar').resolves(true);
            
            // 3. Stub: Recalcular total
            sinon.stub(OrdenesService, 'actualizarTotal').resolves(true);

            await OrdenItemsController.eliminar(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(OrdenesService.actualizarTotal.calledWith(50)).to.be.true;
        });

        it('Debe responder 404 si el item no existe al intentar obtenerlo', async () => {
            req.params.id = 999;
            sinon.stub(OrdenItemsService, 'obtenerPorId').resolves(null);

            await OrdenItemsController.eliminar(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
        });
    });
});