const { expect } = require('chai');
const sinon = require('sinon');

const RolesController = require('../../controllers/RolesController');
const RolesService = require('../../services/RolesService');

describe('Pruebas Unitarias: RolesController', () => {
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

    describe('crearRol', () => {
        it('Debe responder 201 al crear un rol', async () => {
            req.body = { nombre: 'NuevoRol' };
            const rolCreado = { id: 1, nombre: 'NuevoRol' };

            sinon.stub(RolesService, 'crearRol').resolves(rolCreado);

            await RolesController.crearRol(req, res);

            expect(statusStub.calledWith(201)).to.be.true;
            expect(jsonSpy.args[0][0]).to.have.property('message', 'Rol creado exitosamente');
        });

        it('Debe responder 400 si falta el nombre', async () => {
            req.body = {}; // Sin nombre

            await RolesController.crearRol(req, res);

            expect(statusStub.calledWith(400)).to.be.true;
            expect(jsonSpy.args[0][0].message).to.include('nombre es obligatorio');
        });

        it('Debe responder 409 si el rol ya existe', async () => {
            req.body = { nombre: 'Duplicado' };
            // Simulamos el mensaje exacto que lanza tu servicio
            sinon.stub(RolesService, 'crearRol').rejects(new Error('Error al crear rol: Ya existe un rol con ese nombre'));

            await RolesController.crearRol(req, res);

            expect(statusStub.calledWith(409)).to.be.true;
        });
    });

    describe('obtenerTodosLosRoles', () => {
        it('Debe responder 200 con la lista', async () => {
            const lista = [{ id: 1, nombre: 'admin' }];
            sinon.stub(RolesService, 'obtenerTodosLosRoles').resolves(lista);

            await RolesController.obtenerTodosLosRoles(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match({ success: true, data: lista }))).to.be.true;
        });
    });

    describe('eliminarRol', () => {
        it('Debe responder 200 al eliminar', async () => {
            req.params.id = 5;
            sinon.stub(RolesService, 'eliminarRol').resolves({ mensaje: 'OK' });

            await RolesController.eliminarRol(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
        });

        it('Debe responder 409 si es un rol protegido o en uso', async () => {
            req.params.id = 1;
            // Simulamos error de rol protegido
            sinon.stub(RolesService, 'eliminarRol').rejects(new Error('Error: No se puede eliminar un rol predefinido'));

            await RolesController.eliminarRol(req, res);

            expect(statusStub.calledWith(409)).to.be.true;
        });

        it('Debe responder 404 si el rol no existe', async () => {
            req.params.id = 999;
            sinon.stub(RolesService, 'eliminarRol').rejects(new Error('Rol no encontrado'));

            await RolesController.eliminarRol(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
        });
    });

    describe('actualizarRol', () => {
        it('Debe responder 200 al actualizar', async () => {
            req.params.id = 2;
            req.body = { nombre: 'Editado' };
            sinon.stub(RolesService, 'actualizarRol').resolves({ id: 2, nombre: 'Editado' });

            await RolesController.actualizarRol(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
        });

        it('Debe responder 404 si el rol no existe', async () => {
            req.params.id = 999;
            req.body = { nombre: 'X' };
            sinon.stub(RolesService, 'actualizarRol').rejects(new Error('Rol no encontrado'));

            await RolesController.actualizarRol(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
        });
    });
});