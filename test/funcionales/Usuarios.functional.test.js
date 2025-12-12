const { expect } = require('chai');
const sinon = require('sinon');

// Importamos Controlador, Servicio y Modelo
const UsuariosController = require('../../controllers/UsuariosController');
const UsuariosService = require('../../services/UsuariosService');
const Usuarios = require('../../models/Usuarios');

describe('Pruebas Funcionales: UsuariosController', () => {
    let req, res, statusStub, jsonSpy, cookieSpy, clearCookieSpy;

    beforeEach(() => {
        // Mock de Request
        req = {
            body: {},
            params: {},
            query: {},
            cookies: {},
            usuario: { id: 1, rol: 'admin' } // Usuario autenticado por defecto (admin)
        };

        // Mock de Response
        statusStub = sinon.stub();
        jsonSpy = sinon.spy();
        cookieSpy = sinon.spy();
        clearCookieSpy = sinon.spy();

        res = {
            status: statusStub,
            json: jsonSpy,
            cookie: cookieSpy,
            clearCookie: clearCookieSpy
        };

        // Permitir encadenamiento res.status().json()
        statusStub.returns({ json: jsonSpy });
    });

    afterEach(() => {
        sinon.restore();
    });

    /**
     * Prueba: Registro de Usuarios (crear)
     */
    describe('crear', () => {
        it('Debe registrar un usuario y retornar status 201', async () => {
            req.body = {
                nombre: 'Nuevo',
                apellido: 'Usuario',
                correo: 'nuevo@test.com',
                hash_password: '123',
                rol_id: 2
            };

            const fakeId = 10;
            const fakeUsuario = { id: 10, ...req.body, rol_nombre: 'cliente' };

            // 1. Mock del Servicio (creación)
            sinon.stub(UsuariosService, 'crear').resolves(fakeId);
            // 2. Mock del Modelo (recuperación inmediata para respuesta)
            sinon.stub(Usuarios, 'obtenerPorId').resolves(fakeUsuario);

            await UsuariosController.crear(req, res);

            expect(statusStub.calledWith(201)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match({
                success: true,
                mensaje: 'Usuario registrado exitosamente',
                usuario: fakeUsuario
            }))).to.be.true;
        });

        it('Debe retornar 500 si falla el servicio (ej. correo duplicado)', async () => {
            req.body = { correo: 'duplicado@test.com' };
            
            sinon.stub(UsuariosService, 'crear').rejects(new Error('Ya existe un usuario con ese correo'));

            await UsuariosController.crear(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match({
                success: false,
                mensaje: sinon.match(/Ya existe un usuario/)
            }))).to.be.true;
        });
    });

    /**
     * Prueba: Login
     */
    describe('login', () => {
        it('Debe hacer login exitoso, setear cookies y retornar 200', async () => {
            req.body = { correo: 'admin@test.com', hash_password: 'pass' };
            const tokens = { accessToken: 'ACCESS-TOKEN', refreshToken: 'REFRESH-TOKEN' };

            sinon.stub(UsuariosService, 'login').resolves(tokens);

            await UsuariosController.login(req, res);

            // Verificar Status
            expect(statusStub.calledWith(200)).to.be.true;
            
            // Verificar Cookies (Tu controlador setea 2 cookies)
            expect(cookieSpy.calledTwice).to.be.true;
            expect(cookieSpy.calledWith('refreshToken', 'REFRESH-TOKEN')).to.be.true;
            expect(cookieSpy.calledWith('accessToken', 'ACCESS-TOKEN')).to.be.true;

            // Verificar JSON
            expect(jsonSpy.calledWith(sinon.match({
                success: true,
                mensaje: 'Login exitoso'
            }))).to.be.true;
        });

        it('Debe retornar 401 si las credenciales son inválidas', async () => {
            sinon.stub(UsuariosService, 'login').rejects(new Error('Credenciales inválidas'));

            await UsuariosController.login(req, res);

            expect(statusStub.calledWith(401)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match({ success: false }))).to.be.true;
        });
    });

    /**
     * Prueba: Logout
     */
    describe('logout', () => {
        it('Debe limpiar cookies y retornar 200', async () => {
            await UsuariosController.logout(req, res);

            expect(clearCookieSpy.calledWith('refreshToken')).to.be.true;
            expect(clearCookieSpy.calledWith('accessToken')).to.be.true;
            expect(statusStub.calledWith(200)).to.be.true;
        });
    });

    /**
     * Prueba: Refresh Token
     */
    describe('refresh', () => {
        it('Debe renovar token si existe cookie refreshToken válida', async () => {
            req.cookies.refreshToken = 'VALID-REFRESH';
            sinon.stub(UsuariosService, 'refreshTokens').resolves({ newAccessToken: 'NEW-ACCESS' });

            await UsuariosController.refresh(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match({
                success: true,
                access_token: 'NEW-ACCESS'
            }))).to.be.true;
        });

        it('Debe retornar 401 si no hay cookie de refresh', async () => {
            req.cookies = {}; // Sin cookies

            await UsuariosController.refresh(req, res);

            expect(statusStub.calledWith(401)).to.be.true;
        });

        it('Debe retornar 403 si el token es inválido', async () => {
            req.cookies.refreshToken = 'INVALIDO';
            sinon.stub(UsuariosService, 'refreshTokens').rejects(new Error('Token inválido'));

            await UsuariosController.refresh(req, res);

            expect(statusStub.calledWith(403)).to.be.true;
        });
    });

    /**
     * Prueba: Obtener Usuario por ID (Permisos)
     */
    describe('obtenerPorId', () => {
        it('Admin puede ver cualquier usuario', async () => {
            req.usuario = { id: 1, rol: 'admin' };
            req.params.id = '5'; // ID diferente al del admin

            const mockUser = { id: 5, nombre: 'Cliente' };
            sinon.stub(UsuariosService, 'obtenerPorId').resolves(mockUser);

            await UsuariosController.obtenerPorId(req, res);

            expect(statusStub.calledWith(201)).to.be.true; // Nota: Tu controlador retorna 201 en GET (usualmente es 200)
            expect(jsonSpy.calledWith(sinon.match({ usuario: mockUser }))).to.be.true;
        });

        it('Usuario puede ver su propio perfil', async () => {
            req.usuario = { id: 5, rol: 'cliente' };
            req.params.id = '5'; // Mismo ID

            const mockUser = { id: 5, nombre: 'Cliente' };
            sinon.stub(UsuariosService, 'obtenerPorId').resolves(mockUser);

            await UsuariosController.obtenerPorId(req, res);

            expect(statusStub.calledWith(201)).to.be.true;
        });

        it('Usuario NO puede ver perfil de otro (401)', async () => {
            req.usuario = { id: 5, rol: 'cliente' };
            req.params.id = '99'; // ID diferente

            // No debería llamar al servicio
            const serviceSpy = sinon.spy(UsuariosService, 'obtenerPorId');

            await UsuariosController.obtenerPorId(req, res);

            expect(statusStub.calledWith(401)).to.be.true;
            expect(serviceSpy.called).to.be.false;
        });
    });

    /**
     * Prueba: Actualizar Usuario
     */
    describe('actualizar', () => {
        it('Debe actualizar usuario correctamente', async () => {
            req.usuario = { id: 1, rol: 'admin' };
            req.params.id = '5';
            req.body = { nombre: 'Editado' };

            const userActualizado = { id: 5, nombre: 'Editado' };

            sinon.stub(UsuariosService, 'actualizar').resolves(true);
            // El controlador busca el usuario actualizado después del servicio
            sinon.stub(Usuarios, 'obtenerPorId').resolves(userActualizado);

            await UsuariosController.actualizar(req, res);

            expect(statusStub.calledWith(201)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match({
                success: true,
                usuario: userActualizado
            }))).to.be.true;
        });

        it('Debe impedir actualizar otro usuario si no es admin/empleado (401)', async () => {
            req.usuario = { id: 2, rol: 'cliente' };
            req.params.id = '5'; // Intentando editar a otro

            await UsuariosController.actualizar(req, res);

            expect(statusStub.calledWith(401)).to.be.true;
        });
    });

    /**
     * Prueba: Eliminar Usuario
     */
    describe('eliminar', () => {
        it('Debe eliminar usuario y retornar 201', async () => {
            req.params.id = '5';
            sinon.stub(UsuariosService, 'eliminar').resolves(true);

            await UsuariosController.eliminar(req, res);

            expect(statusStub.calledWith(201)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match({
                success: true,
                mensaje: 'Usuario eliminado exitosamente'
            }))).to.be.true;
        });
    });
});