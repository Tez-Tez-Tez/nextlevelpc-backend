const { expect } = require('chai');
const sinon = require('sinon');
const CitaServicioController = require('../../controllers/CitaServicioController');
const citaServicioService = require('../../services/CitaServicioService');

describe('Pruebas Caja Negra: CitaServicioController', () => {
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

    describe('POST /api/citas - create', () => {
        it('Debe responder 201 cuando se crea exitosamente', async () => {
            req.body = {
                cliente_id: 1,
                servicio_id: 1,
                fecha: '2025-01-15',
                hora: '10:00'
            };

            const mockCita = { id: 1, ...req.body, estado: 'pendiente' };
            sinon.stub(citaServicioService, 'createCita').resolves(mockCita);

            await CitaServicioController.create(req, res);

            expect(statusStub.calledWith(201)).to.be.true;
            expect(jsonSpy.args[0][0]).to.have.property('message', 'Cita creada exitosamente.');
        });

        it('Debe responder 500 cuando hay error', async () => {
            req.body = {};

            sinon.stub(citaServicioService, 'createCita').rejects(new Error('Datos inválidos'));

            await CitaServicioController.create(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
        });
    });

    describe('GET /api/citas - getAll', () => {
        it('Debe responder 200 con lista de citas', async () => {
            const mockCitas = [
                { id: 1, cliente_id: 1, servicio_id: 1, estado: 'pendiente' },
                { id: 2, cliente_id: 2, servicio_id: 2, estado: 'completada' }
            ];

            sinon.stub(citaServicioService, 'getAllCitas').resolves(mockCitas);

            await CitaServicioController.getAll(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.args[0][0]).to.have.property('success', true);
            expect(jsonSpy.args[0][0].data).to.be.an('array');
        });
    });

    describe('PATCH /api/citas/:id/status - updateStatus', () => {
        it('Debe responder 200 cuando actualiza el estado', async () => {
            req.params.id = '1';
            req.body = { estado: 'completada' };

            const mockCita = { id: 1, estado: 'completada' };
            sinon.stub(citaServicioService, 'updateCitaStatus').resolves(mockCita);

            await CitaServicioController.updateStatus(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.args[0][0]).to.have.property('message', 'Estado de la cita actualizado correctamente.');
        });
    });
});
