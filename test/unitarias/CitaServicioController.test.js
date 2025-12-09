const { expect } = require('chai');
const sinon = require('sinon');

const CitaServicioController = require('../../controllers/CitaServicioController');
const CitaServicioService = require('../../services/CitaServicioService');

describe('Pruebas Unitarias: CitaServicioController', () => {
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

    describe('create', () => {
        it('Debe responder 201 al crear cita', async () => {
            req.body = { email: 'a@b.com' };
            const citaCreada = { id: 1, ...req.body };
            
            sinon.stub(CitaServicioService, 'createCita').resolves(citaCreada);

            await CitaServicioController.create(req, res);

            expect(statusStub.calledWith(201)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match({ success: true, data: citaCreada }))).to.be.true;
        });

        it('Debe responder 500 si hay error', async () => {
            sinon.stub(CitaServicioService, 'createCita').rejects(new Error('Fallo'));

            await CitaServicioController.create(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
        });
    });

    describe('getAll', () => {
        it('Debe responder 200 con la lista', async () => {
            const lista = [{ id: 1 }];
            sinon.stub(CitaServicioService, 'getAllCitas').resolves(lista);

            await CitaServicioController.getAll(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match({ success: true, data: lista }))).to.be.true;
        });
    });

    describe('updateStatus', () => {
        it('Debe responder 200 al actualizar estado', async () => {
            req.params.id = 1;
            req.body = { estado: 'confirmada' };
            
            sinon.stub(CitaServicioService, 'updateCitaStatus').resolves({ id: 1, estado: 'confirmada' });

            await CitaServicioController.updateStatus(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
        });

        it('Debe responder 500 si el servicio falla', async () => {
            sinon.stub(CitaServicioService, 'updateCitaStatus').rejects(new Error('Error'));
            await CitaServicioController.updateStatus(req, res);
            expect(statusStub.calledWith(500)).to.be.true;
        });
    });

    describe('actualizar', () => {
        it('Debe responder 200 al actualizar datos', async () => {
            req.params.id = 1;
            req.body = { nombre: 'Nuevo' };
            
            sinon.stub(CitaServicioService, 'actualizar').resolves(true);

            await CitaServicioController.actualizar(req, res);

            // Nota: Si tu código tiene el error de mayúscula/minúscula en el controller,
            // esta prueba podría fallar con ReferenceError al ejecutar el código real.
            // Asumiendo que el código está corregido o mockeado:
            expect(statusStub.calledWith(200)).to.be.true;
        });
    });

    describe('deleteCita', () => {
        it('Debe responder 201 al eliminar', async () => {
            req.params.id = 1;
            sinon.stub(CitaServicioService, 'deleteCita').resolves(true);

            await CitaServicioController.deleteCita(req, res);

            expect(statusStub.calledWith(201)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match({ message: 'Cita eliminada exitosamente' }))).to.be.true;
        });

        it('Debe responder 500 si falla', async () => {
            sinon.stub(CitaServicioService, 'deleteCita').rejects(new Error('Error'));
            await CitaServicioController.deleteCita(req, res);
            expect(statusStub.calledWith(500)).to.be.true;
        });
    });
});