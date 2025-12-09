const { expect } = require('chai');
const sinon = require('sinon');

// Aseguramos la ruta correcta al controlador y servicio
const UsuariosController = require('../../controllers/UsuariosController');
const UsuariosService = require('../../services/UsuariosService');
// Necesitamos el modelo solo para mockear llamadas internas si las hubiera (opcional en controller puros)
const Usuarios = require('../../models/Usuarios'); 

describe('Pruebas Unitarias: UsuariosController', () => {
    let req, res, statusStub, jsonSpy;

    beforeEach(() => {
        statusStub = sinon.stub();
        jsonSpy = sinon.spy();
        
        req = {
            body: {},
            params: {},
            query: {},
            cookies: {},
            usuario: { id: 1, rol: 'admin' } // Simulamos usuario autenticado
        };

        res = {
            status: statusStub.returns({ json: jsonSpy }),
            json: jsonSpy,
            cookie: sinon.spy(),
            clearCookie: sinon.spy()
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    // Cambiamos el nombre del describe a 'crear' para coincidir con el método
    describe('crear', () => {
        it('Debe responder 201 cuando se crea el usuario', async () => {
            req.body = { nombre: 'Test', correo: 'test@mail.com' };
            
            // 1. Stub del Servicio: devuelve un ID (ej: 10)
            sinon.stub(UsuariosService, 'crear').resolves(10);
            
            // 2. Stub del Modelo: el controlador llama a Usuarios.obtenerPorId despues de crear
            // para devolver el usuario completo. Debemos simular eso tambien.
            sinon.stub(Usuarios, 'obtenerPorId').resolves({ 
                id: 10, 
                nombre: 'Test', 
                correo: 'test@mail.com' 
            });

            // CORRECCIÓN: Llamamos a .crear() no a .crearUsuario()
            await UsuariosController.crear(req, res);

            expect(statusStub.calledWith(201)).to.be.true;
            expect(jsonSpy.args[0][0]).to.have.property('success', true);
        });

        it('Debe responder 500 si el servicio lanza error', async () => {
            sinon.stub(UsuariosService, 'crear').rejects(new Error('Error DB'));

            // CORRECCIÓN: Llamamos a .crear()
            await UsuariosController.crear(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
            expect(jsonSpy.args[0][0].success).to.be.false;
        });
    });

    describe('login', () => {
        it('Debe responder 200 y devolver tokens', async () => {
            req.body = { correo: 'a@a.com', hash_password: '123' };
            // El servicio devuelve accessToken (camelCase)
            const tokensFromService = { accessToken: 'abc-token', refreshToken: 'xyz-refresh' };

            sinon.stub(UsuariosService, 'login').resolves(tokensFromService);

            await UsuariosController.login(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            
            // CORRECCIÓN: Tu controlador devuelve { access_token: ... } (snake_case)
            const response = jsonSpy.args[0][0];
            expect(response).to.have.property('access_token', 'abc-token');
            
            // Verificamos que se intentaron poner las cookies
            expect(res.cookie.called).to.be.true;
        });

        it('Debe responder 401 si las credenciales fallan', async () => {
            sinon.stub(UsuariosService, 'login').rejects(new Error('Credenciales inválidas'));

            await UsuariosController.login(req, res);

            // Tu controlador maneja el error y devuelve 401
            expect(statusStub.calledWith(401)).to.be.true;
        });
    });
});