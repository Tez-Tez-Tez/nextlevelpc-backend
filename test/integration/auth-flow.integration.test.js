const { expect } = require('chai');
const sinon = require('sinon');
const UsuariosService = require('../../services/UsuariosService');
const Usuarios = require('../../models/Usuarios');
const bcrypt = require('bcrypt');

describe('Pruebas Integración: Flujo de Autenticación', () => {

    afterEach(() => {
        sinon.restore();
    });

    describe('Flujo: Login con credenciales', () => {
        it('Debe fallar el login con credenciales incorrectas', async () => {
            const usuarioMock = {
                id: 1,
                correo: 'testuser@test.com',
                hash_password: await bcrypt.hash('password123', 10),
                rol_nombre: 'cliente'
            };

            sinon.stub(Usuarios, 'obtenerPorCorreo').resolves(usuarioMock);

            const datosLogin = {
                correo: 'testuser@test.com',
                hash_password: 'wrongpassword'
            };

            try {
                await UsuariosService.login(datosLogin);
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error.message).to.include('Credenciales inválidas');
            }
        });
    });

    describe('Flujo: Validación de permisos por rol', () => {
        it('Debe rechazar actualización con correo duplicado', async () => {
            const usuarioExistente = {
                id: 5,
                nombre: 'Usuario',
                correo: 'user@test.com'
            };

            sinon.stub(Usuarios, 'obtenerPorId').resolves(usuarioExistente);
            sinon.stub(Usuarios, 'correoEnUso').resolves(true);

            const datosActualizar = {
                correo: 'duplicado@test.com'
            };

            try {
                await UsuariosService.actualizar(5, datosActualizar);
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error.message).to.include('Ya existe un usuario con ese correo');
            }
        });
    });

    describe('Flujo: Validación de datos en registro', () => {
        it('Debe rechazar registro con datos inválidos', async () => {
            const datosInvalidos = {
                nombre: '',
                correo: 'invalido',
                hash_password: '123'
            };

            try {
                await UsuariosService.crear(datosInvalidos);
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error.message).to.include('Errores de validación');
            }
        });
    });
});
