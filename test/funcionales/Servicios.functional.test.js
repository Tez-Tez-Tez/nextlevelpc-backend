const { expect } = require('chai');
const sinon = require('sinon');

const ServicioController = require('../../controllers/ServicioController');
const ServicioService = require('../../services/ServicioService');

describe('Pruebas Funcionales: Servicios', () => {
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

    describe('Flujo Completo de Gestión de Servicios', () => {
        it('Listar Servicios: Debe retornar todos los servicios disponibles', async () => {
            const mockServicios = [
                { id: 1, nombre: 'Formateo', precio: 50, categoria_id: 1 },
                { id: 2, nombre: 'Limpieza PC', precio: 30, categoria_id: 1 },
                { id: 3, nombre: 'Instalación OS', precio: 80, categoria_id: 2 }
            ];

            sinon.stub(ServicioService, 'getAllServicios').resolves(mockServicios);

            await ServicioController.getAllServicios(req, res);

            expect(jsonSpy.calledWith(sinon.match({ success: true, data: mockServicios }))).to.be.true;
        });

        it('Crear Servicio: Debe crear un nuevo servicio correctamente', async () => {
            req.body = {
                nombre: 'Mantenimiento Preventivo',
                precio: 100,
                descripcion: 'Limpieza completa y optimización',
                categoria_id: 1
            };

            const servicioCreado = { id: 10, ...req.body };
            sinon.stub(ServicioService, 'createServicio').resolves(servicioCreado);

            await ServicioController.createServicio(req, res);

            expect(statusStub.calledWith(201)).to.be.true;
            expect(jsonSpy.args[0][0]).to.have.property('message', 'Servicio creado correctamente');
        });

        it('Crear Servicio: Debe rechazar si falta el nombre', async () => {
            req.body = { precio: 100 }; // Falta nombre

            await ServicioController.createServicio(req, res);

            expect(statusStub.calledWith(400)).to.be.true;
            expect(jsonSpy.args[0][0].message).to.include('requeridos');
        });

        it('Crear Servicio: Debe rechazar si falta el precio', async () => {
            req.body = { nombre: 'Test' }; // Falta precio

            await ServicioController.createServicio(req, res);

            expect(statusStub.calledWith(400)).to.be.true;
        });

        it('Crear Servicio: Debe rechazar duplicados (409)', async () => {
            req.body = { nombre: 'Formateo', precio: 50 };
            sinon.stub(ServicioService, 'createServicio').rejects(new Error('Ya existe un servicio'));

            await ServicioController.createServicio(req, res);

            expect(statusStub.calledWith(409)).to.be.true;
        });

        it('Obtener Servicio por ID: Debe retornar el servicio si existe', async () => {
            req.params.id = 1;
            const mockServicio = { id: 1, nombre: 'Formateo', precio: 50 };

            sinon.stub(ServicioService, 'getServicioById').resolves(mockServicio);

            await ServicioController.getServicioById(req, res);

            expect(jsonSpy.calledWith(sinon.match({ success: true, data: mockServicio }))).to.be.true;
        });

        it('Obtener Servicio por ID: Debe retornar 404 si no existe', async () => {
            req.params.id = 999;
            sinon.stub(ServicioService, 'getServicioById').rejects(new Error('Servicio no encontrado'));

            await ServicioController.getServicioById(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
        });

        it('Actualizar Servicio: Debe actualizar correctamente', async () => {
            req.params.id = 1;
            req.body = { nombre: 'Formateo Premium', precio: 70 };

            const servicioActualizado = { id: 1, ...req.body };
            sinon.stub(ServicioService, 'updateServicio').resolves(servicioActualizado);

            await ServicioController.updateServicio(req, res);

            expect(jsonSpy.calledWith(sinon.match({
                success: true,
                message: 'Servicio actualizado correctamente'
            }))).to.be.true;
        });

        it('Actualizar Servicio: Debe retornar 404 si no existe', async () => {
            req.params.id = 999;
            req.body = { nombre: 'Test' };
            sinon.stub(ServicioService, 'updateServicio').rejects(new Error('Servicio no encontrado'));

            await ServicioController.updateServicio(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
        });

        it('Eliminar Servicio: Debe eliminar correctamente', async () => {
            req.params.id = 1;
            sinon.stub(ServicioService, 'deleteServicio').resolves({ message: 'Servicio eliminado correctamente' });

            await ServicioController.deleteServicio(req, res);

            expect(jsonSpy.calledWith(sinon.match({ success: true }))).to.be.true;
        });
    });
});
