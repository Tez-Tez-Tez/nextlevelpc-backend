const { expect } = require('chai');
const sinon = require('sinon');
const ServicioController = require('../../controllers/ServicioController');
const servicioService = require('../../services/ServicioService');

describe('Pruebas Caja Negra: ServicioController', () => {
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

    describe('GET /api/servicios - getAllServicios', () => {
        it('Debe responder 200 con lista de servicios', async () => {
            const mockServicios = [
                { id: 1, nombre: 'Mantenimiento PC', precio: 50, tipo: 'reparacion' },
                { id: 2, nombre: 'Instalación Software', precio: 30, tipo: 'instalacion' }
            ];

            sinon.stub(servicioService, 'getAllServicios').resolves(mockServicios);

            await ServicioController.getAllServicios(req, res);

            expect(jsonSpy.args[0][0]).to.have.property('success', true);
            expect(jsonSpy.args[0][0].data).to.be.an('array');
            expect(jsonSpy.args[0][0]).to.have.property('count', 2);
        });

        it('Debe responder 500 cuando hay error', async () => {
            sinon.stub(servicioService, 'getAllServicios').rejects(new Error('Error de BD'));

            await ServicioController.getAllServicios(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
        });
    });

    describe('GET /api/servicios/:id - getServicioById', () => {
        it('Debe responder 200 cuando el servicio existe', async () => {
            req.params.id = '1';

            const mockServicio = { id: 1, nombre: 'Mantenimiento PC', precio: 50 };
            sinon.stub(servicioService, 'getServicioById').resolves(mockServicio);

            await ServicioController.getServicioById(req, res);

            expect(jsonSpy.args[0][0]).to.have.property('success', true);
            expect(jsonSpy.args[0][0].data).to.have.property('nombre', 'Mantenimiento PC');
        });

        it('Debe responder 404 cuando el servicio no existe', async () => {
            req.params.id = '999';

            sinon.stub(servicioService, 'getServicioById').rejects(new Error('Servicio no encontrado'));

            await ServicioController.getServicioById(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
        });
    });

    describe('POST /api/servicios - createServicio', () => {
        it('Debe responder 201 cuando se crea exitosamente', async () => {
            req.body = { nombre: 'Nuevo Servicio', precio: 100, tipo: 'reparacion' };

            const mockServicio = { id: 10, ...req.body };
            sinon.stub(servicioService, 'createServicio').resolves(mockServicio);

            await ServicioController.createServicio(req, res);

            expect(statusStub.calledWith(201)).to.be.true;
            expect(jsonSpy.args[0][0]).to.have.property('message', 'Servicio creado correctamente');
        });

        it('Debe responder 400 cuando faltan campos requeridos', async () => {
            req.body = { nombre: 'Servicio sin precio' };

            await ServicioController.createServicio(req, res);

            expect(statusStub.calledWith(400)).to.be.true;
        });

        it('Debe responder 409 cuando el servicio ya existe', async () => {
            req.body = { nombre: 'Servicio Existente', precio: 50 };

            sinon.stub(servicioService, 'createServicio').rejects(new Error('Ya existe un servicio con ese nombre'));

            await ServicioController.createServicio(req, res);

            expect(statusStub.calledWith(409)).to.be.true;
        });
    });

    describe('PATCH /api/servicios/:id - updateServicio', () => {
        it('Debe responder 200 cuando actualiza exitosamente', async () => {
            req.params.id = '1';
            req.body = { precio: 75 };

            const mockServicio = { id: 1, nombre: 'Mantenimiento PC', precio: 75 };
            sinon.stub(servicioService, 'updateServicio').resolves(mockServicio);

            await ServicioController.updateServicio(req, res);

            expect(jsonSpy.args[0][0]).to.have.property('message', 'Servicio actualizado correctamente');
        });

        it('Debe responder 404 cuando el servicio no existe', async () => {
            req.params.id = '999';
            req.body = { precio: 100 };

            sinon.stub(servicioService, 'updateServicio').rejects(new Error('Servicio no encontrado'));

            await ServicioController.updateServicio(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
        });
    });

    describe('DELETE /api/servicios/:id - deleteServicio', () => {
        it('Debe responder 200 cuando elimina exitosamente', async () => {
            req.params.id = '1';

            sinon.stub(servicioService, 'deleteServicio').resolves({ message: 'Servicio eliminado' });

            await ServicioController.deleteServicio(req, res);

            expect(jsonSpy.args[0][0]).to.have.property('success', true);
        });

        it('Debe responder 404 cuando el servicio no existe', async () => {
            req.params.id = '999';

            sinon.stub(servicioService, 'deleteServicio').rejects(new Error('Servicio no encontrado'));

            await ServicioController.deleteServicio(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
        });
    });
});
