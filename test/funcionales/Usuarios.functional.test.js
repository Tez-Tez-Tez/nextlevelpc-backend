const { expect } = require('chai');
const sinon = require('sinon');

const UsuariosController = require('../../controllers/UsuariosController');
const UsuariosService = require('../../services/UsuariosService');
const Usuarios = require('../../models/Usuarios');

describe('Pruebas Funcionales: Usuarios', () => {
    let req, res, statusStub, jsonSpy, cookieSpy, clearCookieSpy;

    beforeEach(() => {
        statusStub = sinon.stub();
        jsonSpy = sinon.spy();
        cookieSpy = sinon.spy();
        clearCookieSpy = sinon.spy();

        req = {
            body: {},
            params: {},
            query: {},
            cookies: {},
            usuario: { id: 1, rol: 'admin' }
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

    describe('Flujo Completo de Autenticación', () => {
        it('Login: Debe autenticar con credenciales válidas', async () => {
            req.body = { correo: 'admin@nextlevel.com', hash_password: 'password123' };
            const tokens = { accessToken: 'JWT-ACCESS', refreshToken: 'JWT-REFRESH' };

            sinon.stub(UsuariosService, 'login').resolves(tokens);

            await UsuariosController.login(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match({ success: true, mensaje: 'Login exitoso' }))).to.be.true;
            expect(cookieSpy.calledWith('refreshToken', 'JWT-REFRESH')).to.be.true;
        });

        it('Login: Debe rechazar credenciales inválidas (401)', async () => {
            req.body = { correo: 'wrong@test.com', hash_password: 'wrongpass' };
            sinon.stub(UsuariosService, 'login').rejects(new Error('Credenciales inválidas'));

            await UsuariosController.login(req, res);

            expect(statusStub.calledWith(401)).to.be.true;
            expect(jsonSpy.args[0][0].success).to.be.false;
        });

        it('Logout: Debe limpiar cookies y sesión', async () => {
            req.cookies.refreshToken = 'old-refresh-token';

            await UsuariosController.logout(req, res);

            expect(clearCookieSpy.calledWith('refreshToken')).to.be.true;
            expect(clearCookieSpy.calledWith('accessToken')).to.be.true;
            expect(statusStub.calledWith(200)).to.be.true;
        });

        it('Refresh: Debe renovar access token con refresh token válido', async () => {
            req.cookies.refreshToken = 'valid-refresh-token';
            sinon.stub(UsuariosService, 'refreshTokens').resolves({ newAccessToken: 'NEW-JWT-ACCESS' });

            await UsuariosController.refresh(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.args[0][0]).to.have.property('access_token', 'NEW-JWT-ACCESS');
        });

        it('Refresh: Debe rechazar sin refresh token (401)', async () => {
            req.cookies = {}; // Sin refresh token

            await UsuariosController.refresh(req, res);

            expect(statusStub.calledWith(401)).to.be.true;
            expect(jsonSpy.args[0][0].success).to.be.false;
        });
    });

    describe('Gestión de Usuarios (CRUD)', () => {
        it('Crear Usuario: Debe registrar nuevo usuario correctamente', async () => {
            req.body = {
                nombre: 'Juan',
                apellido: 'Pérez',
                correo: 'juan@test.com',
                hash_password: 'securepass123',
                rol_id: 2
            };

            sinon.stub(UsuariosService, 'crear').resolves(100);
            sinon.stub(Usuarios, 'obtenerPorId').resolves({
                id: 100,
                nombre: 'Juan',
                apellido: 'Pérez',
                correo: 'juan@test.com',
                rol_nombre: 'cliente'
            });

            await UsuariosController.crear(req, res);

            expect(statusStub.calledWith(201)).to.be.true;
            expect(jsonSpy.args[0][0]).to.include({ success: true });
        });

        it('Crear Usuario: Debe rechazar correo duplicado', async () => {
            req.body = {
                nombre: 'Test',
                correo: 'existente@test.com',
                hash_password: 'pass'
            };

            sinon.stub(UsuariosService, 'crear').rejects(new Error('Ya existe un usuario con ese correo'));

            await UsuariosController.crear(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
        });

        it('Listar Usuarios: Admin debe ver todos los usuarios', async () => {
            const userList = [
                { id: 1, nombre: 'Admin', rol: 'admin' },
                { id: 2, nombre: 'Cliente', rol: 'cliente' }
            ];
            sinon.stub(UsuariosService, 'obtenerTodos').resolves(userList);

            await UsuariosController.obtenerTodos(req, res);

            expect(statusStub.calledWith(201)).to.be.true;
            expect(jsonSpy.args[0][0].usuarios).to.have.lengthOf(2);
        });

        it('Ver Usuario: Admin puede ver cualquier usuario', async () => {
            req.params.id = '5';
            req.usuario = { id: 1, rol: 'admin' };

            const mockUser = { id: 5, nombre: 'Cliente', correo: 'cliente@test.com' };
            sinon.stub(UsuariosService, 'obtenerPorId').resolves(mockUser);

            await UsuariosController.obtenerPorId(req, res);

            expect(statusStub.calledWith(201)).to.be.true;
        });

        it('Ver Usuario: Cliente solo puede ver su propio perfil', async () => {
            req.params.id = '99';
            req.usuario = { id: 1, rol: 'cliente' }; // Cliente ID 1 intentando ver ID 99

            await UsuariosController.obtenerPorId(req, res);

            expect(statusStub.calledWith(401)).to.be.true;
        });

        it('Actualizar Usuario: Debe actualizar datos correctamente', async () => {
            req.params.id = '1';
            req.usuario = { id: 1, rol: 'cliente' };
            req.body = { nombre: 'Nombre Actualizado' };

            sinon.stub(UsuariosService, 'actualizar').resolves(true);
            sinon.stub(Usuarios, 'obtenerPorId').resolves({
                id: 1,
                nombre: 'Nombre Actualizado',
                correo: 'user@test.com'
            });

            await UsuariosController.actualizar(req, res);

            expect(statusStub.calledWith(201)).to.be.true;
            expect(jsonSpy.args[0][0]).to.have.property('mensaje', 'Usuario actualizado exitosamente');
        });

        it('Eliminar Usuario: Debe eliminar correctamente', async () => {
            req.params.id = '5';
            sinon.stub(UsuariosService, 'eliminar').resolves(true);

            await UsuariosController.eliminar(req, res);

            expect(statusStub.calledWith(201)).to.be.true;
            expect(jsonSpy.args[0][0]).to.have.property('mensaje', 'Usuario eliminado exitosamente');
        });
    });

    describe('Validaciones de Seguridad', () => {
        it('No debe permitir login sin correo', async () => {
            req.body = { hash_password: 'password' }; // Falta correo

            await UsuariosController.login(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
        });

        it('No debe permitir login sin contraseña', async () => {
            req.body = { correo: 'test@test.com' }; // Falta password

            await UsuariosController.login(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
        });
    });
});
