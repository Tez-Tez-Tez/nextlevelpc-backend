const { expect } = require('chai');
const sinon = require('sinon');
const UsuariosController = require('../../controllers/UsuariosController');
const UsuariosService = require('../../services/UsuariosService');
const Usuarios = require('../../models/Usuarios');

describe('Pruebas Caja Negra: UsuariosController', () => {
    let req, res, statusStub, jsonSpy, cookieSpy, clearCookieSpy;

    beforeEach(() => {
        statusStub = sinon.stub();
        jsonSpy = sinon.spy();
        cookieSpy = sinon.spy();
        clearCookieSpy = sinon.spy();

        req = {
            body: {},
            params: {},
            cookies: {},
            usuario: {}
        };

        res = {
            status: statusStub.returns({ json: jsonSpy }),
            json: jsonSpy,
            cookie: cookieSpy,
            clearCookie: clearCookieSpy
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('POST /api/usuarios/login - login', () => {
        it('Debe responder 200 y establecer cookies cuando login es exitoso', async () => {
            req.body = {
                correo: 'juan@test.com',
                hash_password: 'password123'
            };

            const mockTokens = {
                accessToken: 'mock-access-token',
                refreshToken: 'mock-refresh-token'
            };

            sinon.stub(UsuariosService, 'login').resolves(mockTokens);

            await UsuariosController.login(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.args[0][0]).to.have.property('success', true);
            expect(jsonSpy.args[0][0]).to.have.property('mensaje', 'Login exitoso');
            expect(cookieSpy.calledTwice).to.be.true;
        });

        it('Debe responder 401 cuando las credenciales son inválidas', async () => {
            req.body = {
                correo: 'wrong@test.com',
                hash_password: 'wrongpassword'
            };

            sinon.stub(UsuariosService, 'login').rejects(new Error('Credenciales inválidas'));

            await UsuariosController.login(req, res);

            expect(statusStub.calledWith(401)).to.be.true;
            expect(jsonSpy.args[0][0].success).to.be.false;
        });
    });

    describe('POST /api/usuarios/logout - logout', () => {
        it('Debe responder 200 y limpiar cookies', async () => {
            await UsuariosController.logout(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.args[0][0]).to.have.property('success', true);
            expect(clearCookieSpy.calledTwice).to.be.true;
        });
    });

    describe('POST /api/usuarios/refresh - refresh', () => {
        it('Debe responder 200 con nuevo access token cuando refresh token es válido', async () => {
            req.cookies.refreshToken = 'valid-refresh-token';

            sinon.stub(UsuariosService, 'refreshTokens').resolves({
                newAccessToken: 'new-access-token'
            });

            await UsuariosController.refresh(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.args[0][0]).to.have.property('access_token', 'new-access-token');
        });

        it('Debe responder 401 cuando no hay refresh token', async () => {
            req.cookies = {};

            await UsuariosController.refresh(req, res);

            expect(statusStub.calledWith(401)).to.be.true;
            expect(jsonSpy.args[0][0].success).to.be.false;
        });
    });

    describe('GET /api/usuarios - obtenerTodos', () => {
        it('Debe responder 201 con lista de usuarios', async () => {
            const mockUsuarios = [
                { id: 1, nombre: 'Usuario 1', correo: 'user1@test.com' },
                { id: 2, nombre: 'Usuario 2', correo: 'user2@test.com' }
            ];

            sinon.stub(UsuariosService, 'obtenerTodos').resolves(mockUsuarios);

            await UsuariosController.obtenerTodos(req, res);

            expect(statusStub.calledWith(201)).to.be.true;
            expect(jsonSpy.args[0][0].usuarios).to.be.an('array');
            expect(jsonSpy.args[0][0].usuarios).to.have.lengthOf(2);
        });
    });

    describe('GET /api/usuarios/:id - obtenerPorId', () => {
        it('Debe responder 201 cuando el usuario existe y tiene permisos', async () => {
            req.params.id = '1';
            req.usuario = { id: 1, rol: 'admin' };

            const mockUsuario = { id: 1, nombre: 'Admin', correo: 'admin@test.com' };
            sinon.stub(UsuariosService, 'obtenerPorId').resolves(mockUsuario);

            await UsuariosController.obtenerPorId(req, res);

            expect(statusStub.calledWith(201)).to.be.true;
            expect(jsonSpy.args[0][0].usuario).to.have.property('id', 1);
        });

        it('Debe responder 401 cuando intenta ver otro usuario sin ser admin', async () => {
            req.params.id = '2';
            req.usuario = { id: 1, rol: 'cliente' };

            await UsuariosController.obtenerPorId(req, res);

            expect(statusStub.calledWith(401)).to.be.true;
        });
    });

    describe('PATCH /api/usuarios/:id - actualizar', () => {
        it('Debe responder 201 cuando actualiza exitosamente', async () => {
            req.params.id = '1';
            req.usuario = { id: 1, rol: 'cliente' };
            req.body = { nombre: 'Nuevo Nombre' };

            sinon.stub(UsuariosService, 'actualizar').resolves(true);
            sinon.stub(Usuarios, 'obtenerPorId').resolves({
                id: 1,
                nombre: 'Nuevo Nombre',
                correo: 'user@test.com'
            });

            await UsuariosController.actualizar(req, res);

            expect(statusStub.calledWith(201)).to.be.true;
            expect(jsonSpy.args[0][0]).to.have.property('mensaje', 'Usuario actualizado exitosamente');
        });
    });

    describe('DELETE /api/usuarios/:id - eliminar', () => {
        it('Debe responder 201 cuando elimina exitosamente', async () => {
            req.params.id = '1';

            sinon.stub(UsuariosService, 'eliminar').resolves(true);

            await UsuariosController.eliminar(req, res);

            expect(statusStub.calledWith(201)).to.be.true;
            expect(jsonSpy.args[0][0]).to.have.property('mensaje', 'Usuario eliminado exitosamente');
        });
    });
});
