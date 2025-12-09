const { expect } = require('chai');
const sinon = require('sinon');

const OrdenesController = require('../../controllers/OrdenesController');
const OrdenesService = require('../../services/OrdenesService');
const OrdenItemsService = require('../../services/OrdenItemsService');

describe('Pruebas Unitarias: OrdenesController', () => {
    let req, res, statusStub, jsonSpy;

    beforeEach(() => {
        statusStub = sinon.stub();
        jsonSpy = sinon.spy();
        
        req = {
            body: {},
            params: {},
            query: {},
            usuario: { id: 1, rol: 'admin' } // Simulamos que quien pide es Admin por defecto
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
        it('Debe responder 201 al crear la orden', async () => {
            // Datos mínimos válidos para que el DTO no falle
            req.body = { cliente_id: 1, tipo: 'producto', total: 100 };
            
            const insertId = 10;
            const ordenCreada = { 
                id: 10, 
                ...req.body, 
                created_at: new Date(), 
                numero_orden: 'ORD-TEST' 
            };

            sinon.stub(OrdenesService, 'crear').resolves(insertId);
            // El controlador llama a obtenerPorId justo despues de crear
            sinon.stub(OrdenesService, 'obtenerPorId').resolves(ordenCreada);

            await OrdenesController.crear(req, res);

            expect(statusStub.calledWith(201)).to.be.true;
            expect(jsonSpy.args[0][0].success).to.be.true;
        });
    });

    describe('obtenerPorId', () => {
        it('Debe responder 200 si el usuario es Admin', async () => {
            req.params.id = 1;
            const orden = { id: 1, clienteId: 5, total: 50 };
            
            req.usuario = { id: 1, rol: 'admin' }; // Admin pide orden de cliente 5

            sinon.stub(OrdenesService, 'obtenerPorId').resolves(orden);

            await OrdenesController.obtenerPorId(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
        });

        it('Debe responder 403 si el usuario intenta ver una orden ajena', async () => {
            req.params.id = 1;
            // Orden pertenece al cliente 5
            const orden = { id: 1, clienteId: 5 }; 
            
            // Usuario es cliente 2 (intruso)
            req.usuario = { id: 2, rol: 'cliente' };

            sinon.stub(OrdenesService, 'obtenerPorId').resolves(orden);

            await OrdenesController.obtenerPorId(req, res);

            expect(statusStub.calledWith(403)).to.be.true;
            expect(jsonSpy.args[0][0].mensaje).to.include('Solo puedes ver ordenes que son tuyas');
        });

        it('Debe responder 404 si la orden no existe', async () => {
            req.params.id = 999;
            sinon.stub(OrdenesService, 'obtenerPorId').resolves(null);

            await OrdenesController.obtenerPorId(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
        });
    });

    describe('obtenerPorNumeroOrden', () => {
        it('Debe responder 200 y traer los items', async () => {
            req.params.numeroOrden = 'ORD-123';
            
            // Mockeamos la búsqueda
            const listaOrdenes = [{ id: 1, numero_orden: 'ORD-123', cliente_id: 1 }];
            const items = [{ id: 1, descripcion: 'Mouse Gamer' }];

            sinon.stub(OrdenesService, 'obtenerTodos').resolves(listaOrdenes);
            sinon.stub(OrdenItemsService, 'obtenerPorOrden').resolves(items);

            await OrdenesController.obtenerPorNumeroOrden(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            // Verificamos que la respuesta incluye los items
            expect(jsonSpy.args[0][0].data).to.have.property('items');
        });
    });

    describe('actualizar', () => {
        it('Debe responder 200 al actualizar estado', async () => {
            req.params.id = 1;
            req.body = { estado_orden: 'completada' };

            sinon.stub(OrdenesService, 'actualizar').resolves(true);

            await OrdenesController.actualizar(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
        });
    });

    describe('eliminar', () => {
        it('Debe responder 200 al eliminar', async () => {
            req.params.id = 1;
            sinon.stub(OrdenesService, 'eliminar').resolves(true);

            await OrdenesController.eliminar(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
        });
    });
});