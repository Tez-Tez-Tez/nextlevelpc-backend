const { expect } = require('chai');
const sinon = require('sinon');

const ServicioController = require('../../controllers/ServicioController');
const ServicioService = require('../../services/ServicioService');

describe('Pruebas Unitarias: ServicioController', () => {
    let req, res, statusStub, jsonSpy;

    beforeEach(() => {
        statusStub = sinon.stub();
        jsonSpy = sinon.spy();
        
        req = {
            body: {},
            params: {},
            query: {}
        };
        
        res = {
            status: statusStub.returns({ json: jsonSpy }),
            json: jsonSpy
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('getAllServicios', () => {
        it('Debe responder 200 con la lista de servicios', async () => {
            const lista = [{ id: 1, nombre: 'S1' }];
            sinon.stub(ServicioService, 'getAllServicios').resolves(lista);

            await ServicioController.getAllServicios(req, res);

            // En tu controller usas res.json directamente (que es status 200 por defecto)
            // O verificamos si llamó a json con success: true
            expect(jsonSpy.calledWith(sinon.match({ success: true, data: lista }))).to.be.true;
        });

        it('Debe responder 500 si hay error', async () => {
            sinon.stub(ServicioService, 'getAllServicios').rejects(new Error('Fallo'));
            
            await ServicioController.getAllServicios(req, res);
            
            expect(statusStub.calledWith(500)).to.be.true;
        });
    });

    describe('getServicioById', () => {
        it('Debe responder 200 si encuentra el servicio', async () => {
            req.params.id = 1;
            const servicio = { id: 1, nombre: 'Test' };
            
            sinon.stub(ServicioService, 'getServicioById').resolves(servicio);

            await ServicioController.getServicioById(req, res);

            expect(jsonSpy.calledWith(sinon.match({ success: true, data: servicio }))).to.be.true;
        });

        it('Debe responder 404 si no encuentra el servicio', async () => {
            req.params.id = 999;
            sinon.stub(ServicioService, 'getServicioById').rejects(new Error('Servicio no encontrado'));

            await ServicioController.getServicioById(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
        });
    });

    describe('createServicio', () => {
        it('Debe responder 201 al crear exitosamente', async () => {
            req.body = { nombre: 'Nuevo', precio: 100 };
            const creado = { id: 1, ...req.body };

            sinon.stub(ServicioService, 'createServicio').resolves(creado);

            await ServicioController.createServicio(req, res);

            expect(statusStub.calledWith(201)).to.be.true;
            expect(jsonSpy.args[0][0]).to.have.property('message', 'Servicio creado correctamente');
        });

        it('Debe responder 400 si faltan campos obligatorios', async () => {
            req.body = { nombre: 'Solo nombre' }; // Falta precio

            await ServicioController.createServicio(req, res);

            expect(statusStub.calledWith(400)).to.be.true;
            expect(jsonSpy.args[0][0].message).to.include('requeridos');
        });

        it('Debe responder 409 si el servicio ya existe', async () => {
            req.body = { nombre: 'Duplicado', precio: 10 };
            sinon.stub(ServicioService, 'createServicio').rejects(new Error('Ya existe un servicio'));

            await ServicioController.createServicio(req, res);

            expect(statusStub.calledWith(409)).to.be.true;
        });
    });

    describe('updateServicio', () => {
        it('Debe responder 200 al actualizar', async () => {
            req.params.id = 1;
            req.body = { nombre: 'Update' };
            
            sinon.stub(ServicioService, 'updateServicio').resolves({ id: 1, ...req.body });

            await ServicioController.updateServicio(req, res);

            expect(jsonSpy.calledWith(sinon.match({ success: true, message: 'Servicio actualizado correctamente' }))).to.be.true;
        });

        it('Debe responder 404 si intenta actualizar algo inexistente', async () => {
            req.params.id = 999;
            sinon.stub(ServicioService, 'updateServicio').rejects(new Error('Servicio no encontrado'));

            await ServicioController.updateServicio(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
        });
    });

    describe('deleteServicio', () => {
        it('Debe responder con éxito al eliminar', async () => {
            req.params.id = 1;
            sinon.stub(ServicioService, 'deleteServicio').resolves({ message: 'OK' });

            await ServicioController.deleteServicio(req, res);

            expect(jsonSpy.calledWith(sinon.match({ success: true }))).to.be.true;
        });
    });
});