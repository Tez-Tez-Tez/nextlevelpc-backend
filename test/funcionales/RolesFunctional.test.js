const { expect } = require('chai');
const sinon = require('sinon');
const RolesController = require('../../controllers/RolesController');
const RolesService = require('../../services/RolesService');

describe('Pruebas Funcionales: RolesController', () => {
    let req, res, statusStub, jsonSpy;

    // Configuración antes de cada prueba
    beforeEach(() => {
        req = {
            body: {},
            params: {}
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

    // Limpieza después de cada prueba
    afterEach(() => {
        sinon.restore();
    });

    /**
     * Prueba: Crear Rol
     */
    describe('crearRol', () => {
        it('Debe retornar status 201 y el rol creado exitosamente', async () => {
            req.body = { nombre: 'SuperAdmin' };
            const mockRol = { id: 1, nombre: 'SuperAdmin' };

            sinon.stub(RolesService, 'crearRol').resolves(mockRol);

            await RolesController.crearRol(req, res);

            expect(statusStub.calledWith(201)).to.be.true;
            expect(jsonSpy.calledWith({
                success: true,
                message: 'Rol creado exitosamente',
                data: mockRol
            })).to.be.true;
        });

        it('Debe retornar status 409 si el nombre del rol ya existe', async () => {
            req.body = { nombre: 'Admin' };
            // Simulamos el error específico que busca el controlador
            sinon.stub(RolesService, 'crearRol').rejects(new Error('Ya existe un rol con ese nombre'));

            await RolesController.crearRol(req, res);

            expect(statusStub.calledWith(409)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match({ success: false }))).to.be.true;
        });

        it('Debe retornar status 400 si falta el nombre en el body', async () => {
            req.body = {}; // Sin nombre

            await RolesController.crearRol(req, res);

            // El controlador valida esto antes de llamar al servicio
            expect(statusStub.calledWith(400)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match({ message: 'El campo nombre es obligatorio' }))).to.be.true;
        });
    });

    /**
     * Prueba: Obtener Todos los Roles
     */
    describe('obtenerTodosLosRoles', () => {
        it('Debe retornar status 200 y la lista de roles', async () => {
            const mockRoles = [{ id: 1, nombre: 'Admin' }, { id: 2, nombre: 'Cliente' }];
            sinon.stub(RolesService, 'obtenerTodosLosRoles').resolves(mockRoles);

            await RolesController.obtenerTodosLosRoles(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.calledWith({
                success: true,
                data: mockRoles
            })).to.be.true;
        });
    });

    /**
     * Prueba: Obtener Rol por ID
     */
    describe('obtenerRolPorId', () => {
        it('Debe retornar status 200 y el rol encontrado', async () => {
            req.params.id = 1;
            const mockRol = { id: 1, nombre: 'Admin' };
            sinon.stub(RolesService, 'obtenerRolPorId').resolves(mockRol);

            await RolesController.obtenerRolPorId(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.calledWith({
                success: true,
                data: mockRol
            })).to.be.true;
        });

        it('Debe retornar status 404 si el rol no existe', async () => {
            req.params.id = 999;
            sinon.stub(RolesService, 'obtenerRolPorId').rejects(new Error('Rol no encontrado'));

            await RolesController.obtenerRolPorId(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match({ message: 'Rol no encontrado' }))).to.be.true;
        });
    });

    /**
     * Prueba: Actualizar Rol
     */
    describe('actualizarRol', () => {
        it('Debe retornar status 200 y el rol actualizado', async () => {
            req.params.id = 1;
            req.body = { nombre: 'AdminActualizado' };
            
            const mockRol = { id: 1, nombre: 'AdminActualizado' };
            sinon.stub(RolesService, 'actualizarRol').resolves(mockRol);

            await RolesController.actualizarRol(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.calledWith({
                success: true,
                message: 'Rol actualizado exitosamente',
                data: mockRol
            })).to.be.true;
        });

        it('Debe retornar status 409 si el nuevo nombre ya existe en otro rol', async () => {
            req.params.id = 1;
            req.body = { nombre: 'Existente' };

            sinon.stub(RolesService, 'actualizarRol').rejects(new Error('Ya existe otro rol con ese nombre'));

            await RolesController.actualizarRol(req, res);

            expect(statusStub.calledWith(409)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match({ success: false }))).to.be.true;
        });

        it('Debe retornar status 404 si el rol a actualizar no existe', async () => {
            req.params.id = 999;
            req.body = { nombre: 'Nuevo' };

            sinon.stub(RolesService, 'actualizarRol').rejects(new Error('Rol no encontrado'));

            await RolesController.actualizarRol(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
        });
    });

    /**
     * Prueba: Eliminar Rol
     */
    describe('eliminarRol', () => {
        it('Debe retornar status 200 si se elimina correctamente', async () => {
            req.params.id = 5;
            sinon.stub(RolesService, 'eliminarRol').resolves({ mensaje: 'Rol eliminado correctamente' });

            await RolesController.eliminarRol(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.calledWith({
                success: true,
                message: 'Rol eliminado correctamente'
            })).to.be.true;
        });

        it('Debe retornar status 409 si el rol está protegido (ej. Admin)', async () => {
            req.params.id = 1;
            // Simulamos error de rol protegido
            sinon.stub(RolesService, 'eliminarRol').rejects(new Error('No se puede eliminar un rol predefinido del sistema'));

            await RolesController.eliminarRol(req, res);

            expect(statusStub.calledWith(409)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match({ success: false }))).to.be.true;
        });

        it('Debe retornar status 409 si el rol está siendo usado por usuarios', async () => {
            req.params.id = 2;
            // Simulamos error de integridad referencial
            sinon.stub(RolesService, 'eliminarRol').rejects(new Error('No se puede eliminar el rol porque está siendo usado por uno o más usuarios'));

            await RolesController.eliminarRol(req, res);

            expect(statusStub.calledWith(409)).to.be.true;
        });

        it('Debe retornar status 404 si el rol no existe', async () => {
            req.params.id = 999;
            sinon.stub(RolesService, 'eliminarRol').rejects(new Error('Rol no encontrado'));

            await RolesController.eliminarRol(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
        });
    });

    /**
     * Prueba: Estadísticas y Utilidades
     */
    describe('obtenerRolesConEstadisticas', () => {
        it('Debe retornar status 200 con estadísticas', async () => {
            const mockStats = [{ id: 1, nombre: 'Admin', total_usuarios: 5 }];
            sinon.stub(RolesService, 'obtenerRolesConEstadisticas').resolves(mockStats);

            await RolesController.obtenerRolesConEstadisticas(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.calledWith({
                success: true,
                data: mockStats
            })).to.be.true;
        });
    });
});