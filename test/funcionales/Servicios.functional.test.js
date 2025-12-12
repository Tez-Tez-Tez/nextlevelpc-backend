const { expect } = require('chai');
const sinon = require('sinon');

// Importamos Controlador y Servicio
const ServicioController = require('../../controllers/ServicioController');
const ServicioService = require('../../services/ServicioService');

describe('Pruebas Funcionales: ServicioController', () => {
    let req, res, statusStub, jsonSpy;

    // Configuración antes de cada prueba
    beforeEach(() => {
        req = {
            body: {},
            params: {},
            query: {}
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
     * Prueba: Obtener Todos los Servicios
     */
    describe('getAllServicios', () => {
        it('Debe retornar status 200 (implícito en json) y la lista de servicios', async () => {
            const mockServicios = [
                { id: 1, nombre: 'Mantenimiento', precio: 50 },
                { id: 2, nombre: 'Reparación', precio: 80 }
            ];

            // Simulamos el servicio
            sinon.stub(ServicioService, 'getAllServicios').resolves(mockServicios);

            await ServicioController.getAllServicios(req, res);

            // Nota: tu controlador usa res.json() directamente para éxito, sin status explícito a veces
            // Verifica si tu controlador usa res.json({...}) o res.status(200).json(...)
            // Basado en tu código: res.json(...)
            expect(jsonSpy.calledWith(sinon.match({
                success: true,
                data: mockServicios,
                count: 2
            }))).to.be.true;
        });

        it('Debe retornar status 500 si falla el servicio', async () => {
            sinon.stub(ServicioService, 'getAllServicios').rejects(new Error('Error de conexión'));

            await ServicioController.getAllServicios(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match({ success: false }))).to.be.true;
        });
    });

    /**
     * Prueba: Obtener Servicios por Tipo
     */
    describe('getServiciosByTipo', () => {
        it('Debe retornar los servicios filtrados por tipo', async () => {
            req.params.tipo = 'basico';
            const mockServicios = [{ id: 1, nombre: 'Limpieza', tipo: 'basico' }];

            sinon.stub(ServicioService, 'getServiciosByTipo').resolves(mockServicios);

            await ServicioController.getServiciosByTipo(req, res);

            expect(jsonSpy.calledWith(sinon.match({
                success: true,
                data: mockServicios
            }))).to.be.true;
        });

        it('Debe retornar status 400 si el tipo es inválido', async () => {
            req.params.tipo = 'invalido';
            // El servicio lanza el error, el controlador lo captura y devuelve 400
            sinon.stub(ServicioService, 'getServiciosByTipo').rejects(new Error('Tipo de servicio inválido'));

            await ServicioController.getServiciosByTipo(req, res);

            expect(statusStub.calledWith(400)).to.be.true;
        });
    });

    /**
     * Prueba: Obtener Servicio por ID
     */
    describe('getServicioById', () => {
        it('Debe retornar el servicio si existe', async () => {
            req.params.id = 1;
            const mockServicio = { id: 1, nombre: 'Test' };

            sinon.stub(ServicioService, 'getServicioById').resolves(mockServicio);

            await ServicioController.getServicioById(req, res);

            expect(jsonSpy.calledWith(sinon.match({
                success: true,
                data: mockServicio
            }))).to.be.true;
        });

        it('Debe retornar status 404 si no existe', async () => {
            req.params.id = 999;
            sinon.stub(ServicioService, 'getServicioById').rejects(new Error('Servicio no encontrado'));

            await ServicioController.getServicioById(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match({ message: 'Servicio no encontrado' }))).to.be.true;
        });
    });

    /**
     * Prueba: Crear Servicio
     */
    describe('createServicio', () => {
        it('Debe crear un servicio y retornar 201', async () => {
            req.body = { nombre: 'Nuevo Servicio', precio: 100 };
            const servicioCreado = { id: 10, ...req.body };

            sinon.stub(ServicioService, 'createServicio').resolves(servicioCreado);

            await ServicioController.createServicio(req, res);

            expect(statusStub.calledWith(201)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match({
                success: true,
                message: 'Servicio creado correctamente',
                data: servicioCreado
            }))).to.be.true;
        });

        it('Debe retornar 400 si faltan campos obligatorios (validación controlador)', async () => {
            req.body = { precio: 100 }; // Falta nombre

            // No debería llamar al servicio
            const serviceSpy = sinon.spy(ServicioService, 'createServicio');

            await ServicioController.createServicio(req, res);

            expect(statusStub.calledWith(400)).to.be.true;
            expect(serviceSpy.called).to.be.false;
        });

        it('Debe retornar 409 si ya existe un servicio con ese nombre', async () => {
            req.body = { nombre: 'Duplicado', precio: 100 };
            
            sinon.stub(ServicioService, 'createServicio').rejects(new Error('Ya existe un servicio con ese nombre'));

            await ServicioController.createServicio(req, res);

            expect(statusStub.calledWith(409)).to.be.true;
        });
    });

    /**
     * Prueba: Actualizar Servicio
     */
    describe('updateServicio', () => {
        it('Debe actualizar el servicio correctamente', async () => {
            req.params.id = 1;
            req.body = { precio: 150 };
            const servicioActualizado = { id: 1, nombre: 'Test', precio: 150 };

            sinon.stub(ServicioService, 'updateServicio').resolves(servicioActualizado);

            await ServicioController.updateServicio(req, res);

            // El controlador usa res.json() por defecto (status 200 implícito)
            expect(jsonSpy.calledWith(sinon.match({
                success: true,
                message: 'Servicio actualizado correctamente',
                data: servicioActualizado
            }))).to.be.true;
        });

        it('Debe retornar 404 si el servicio a actualizar no existe', async () => {
            req.params.id = 999;
            sinon.stub(ServicioService, 'updateServicio').rejects(new Error('Servicio no encontrado'));

            await ServicioController.updateServicio(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
        });

        it('Debe retornar 409 si el nuevo nombre ya existe', async () => {
            req.params.id = 1;
            sinon.stub(ServicioService, 'updateServicio').rejects(new Error('Ya existe otro servicio con ese nombre'));

            await ServicioController.updateServicio(req, res);

            expect(statusStub.calledWith(409)).to.be.true;
        });
    });

    /**
     * Prueba: Eliminar Servicio
     */
    describe('deleteServicio', () => {
        it('Debe eliminar el servicio correctamente', async () => {
            req.params.id = 1;
            sinon.stub(ServicioService, 'deleteServicio').resolves({ message: 'Servicio eliminado correctamente' });

            await ServicioController.deleteServicio(req, res);

            expect(jsonSpy.calledWith(sinon.match({
                success: true,
                message: 'Servicio eliminado correctamente'
            }))).to.be.true;
        });

        it('Debe retornar 404 si el servicio no existe', async () => {
            req.params.id = 999;
            sinon.stub(ServicioService, 'deleteServicio').rejects(new Error('Servicio no encontrado'));

            await ServicioController.deleteServicio(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
        });
    });
});