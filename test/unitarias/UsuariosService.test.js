const { expect } = require('chai');
const sinon = require('sinon');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const UsuariosService = require('../../services/UsuariosService');
const Usuarios = require('../../models/Usuarios');

describe('Pruebas Unitarias: UsuariosService', () => {

    afterEach(() => {
        sinon.restore();
    });

    describe('crear (Registro)', () => {
        it('Debe crear un usuario si el correo no existe', async () => {
            const datosUsuario = {
                nombre: 'Juan',
                apellido: 'Perez',
                correo: 'juan@test.com',
                hash_password: 'passwordSeguro123',
                rol_id: 2
            };

            // Stubs para flujo exitoso
            sinon.stub(Usuarios, 'obtenerPorCorreo').resolves(null); // No existe
            sinon.stub(Usuarios, 'crear').resolves(50); // Crea ID 50

            const resultado = await UsuariosService.crear(datosUsuario);

            expect(resultado).to.equal(50);
        });

        it('Debe lanzar error si el correo ya existe', async () => {
            // DATOS COMPLETOS para pasar la validación inicial del DTO
            const datosUsuario = { 
                nombre: 'Duplicado',
                apellido: 'Test',
                correo: 'existente@test.com', 
                hash_password: 'passwordSeguro123',
                rol_id: 2 
            };

            // Simulamos que el correo YA existe en BD
            sinon.stub(Usuarios, 'obtenerPorCorreo').resolves({ id: 1, correo: 'existente@test.com' });

            try {
                await UsuariosService.crear(datosUsuario);
            } catch (error) {
                expect(error.message).to.equal('Ya existe un usuario con ese correo');
            }
        });
    });

    describe('login', () => {
        it('Debe retornar tokens cuando las credenciales son válidas', async () => {
            const credenciales = { correo: 'juan@test.com', hash_password: 'password123' };
            const usuarioEncontrado = {
                id: 1,
                correo: 'juan@test.com',
                hash_password: 'hash_en_db',
                rol_nombre: 'cliente'
            };

            sinon.stub(Usuarios, 'obtenerPorCorreo').resolves(usuarioEncontrado);
            sinon.stub(bcrypt, 'compare').resolves(true); // Password coincide
            sinon.stub(jwt, 'sign').returns('fake_token'); // Genera token
            sinon.stub(Usuarios, 'guardarRefreshToken').resolves(true);

            const resultado = await UsuariosService.login(credenciales);

            expect(resultado).to.have.property('accessToken');
            expect(resultado).to.have.property('refreshToken');
        });
    });
});