const { expect } = require('chai');
const sinon = require('sinon');
const RolesController = require('../../controllers/RolesController');
const RolesService = require('../../services/RolesService');

describe('Pruebas Caja Negra: RolesController', () => {
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

    describe('GET /api/roles - obtenerTodosLosRoles', () => {
        it('Debe responder 200 con lista de roles', async () => {
            const mockRoles = [
                { id: 1, nombre: 'admin' },
                { id: 2, nombre: 'cliente' },
                { id: 3, nombre: 'empleado' }
            ];

            sinon.stub(RolesService, 'obtenerTodosLosRoles').resolves(mockRoles);

            await RolesController.obtenerTodosLosRoles(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.args[0][0]).to.have.property('success', true);
            expect(jsonSpy.args[0][0].data).to.be.an('array');
        });
    });

    describe('GET /api/roles/:id - obtenerRolPorId', () => {
        it('Debe responder 200 cuando el rol existe', async () => {
            req.params.id = '1';

            const mockRol = { id: 1, nombre: 'admin' };
            sinon.stub(RolesService, 'obtenerRolPorId').resolves(mockRol);

            await RolesController.obtenerRolPorId(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.args[0][0].data).to.have.property('nombre', 'admin');
        });

        it('Debe responder 404 cuando el rol no existe', async () => {
            req.params.id = '999';

            sinon.stub(RolesService, 'obtenerRolPorId').rejects(new Error('Rol no encontrado'));

            await RolesController.obtenerRolPorId(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
        });
    });

    describe('POST /api/roles - crearRol', () => {
        it('Debe responder 201 cuando se crea exitosamente', async () => {
            req.body = { nombre: 'moderador' };

            const mockRol = { id: 4, nombre: 'moderador' };
            sinon.stub(RolesService, 'crearRol').resolves(mockRol);

            await RolesController.crearRol(req, res);

            expect(statusStub.calledWith(201)).to.be.true;
            expect(jsonSpy.args[0][0]).to.have.property('message', 'Rol creado exitosamente');
        });

        it('Debe responder 400 cuando falta el nombre', async () => {
            req.body = {};

            await RolesController.crearRol(req, res);

            expect(statusStub.calledWith(400)).to.be.true;
        });

        it('Debe responder 409 cuando el rol ya existe', async () => {
            req.body = { nombre: 'admin' };

            sinon.stub(RolesService, 'crearRol').rejects(new Error('Ya existe un rol con ese nombre'));

            await RolesController.crearRol(req, res);

            expect(statusStub.calledWith(409)).to.be.true;
        });
    });

    describe('PATCH /api/roles/:id - actualizarRol', () => {
        it('Debe responder 200 cuando actualiza exitosamente', async () => {
            req.params.id = '1';
            req.body = { nombre: 'super-admin' };

            const mockRol = { id: 1, nombre: 'super-admin' };
            sinon.stub(RolesService, 'actualizarRol').resolves(mockRol);

            await RolesController.actualizarRol(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.args[0][0]).to.have.property('message', 'Rol actualizado exitosamente');
        });

        it('Debe responder 404 cuando el rol no existe', async () => {
            req.params.id = '999';
            req.body = { nombre: 'test' };

            sinon.stub(RolesService, 'actualizarRol').rejects(new Error('Rol no encontrado'));

            await RolesController.actualizarRol(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
        });
    });

    describe('DELETE /api/roles/:id - eliminarRol', () => {
        it('Debe responder 200 cuando elimina exitosamente', async () => {
            req.params.id = '4';

            sinon.stub(RolesService, 'eliminarRol').resolves({ mensaje: 'Rol eliminado' });

            await RolesController.eliminarRol(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.args[0][0]).to.have.property('success', true);
        });

        it('Debe responder 409 cuando el rol está en uso', async () => {
            req.params.id = '1';

            sinon.stub(RolesService, 'eliminarRol').rejects(new Error('No se puede eliminar el rol porque está siendo usado'));

            await RolesController.eliminarRol(req, res);

            expect(statusStub.calledWith(409)).to.be.true;
        });
    });
});
