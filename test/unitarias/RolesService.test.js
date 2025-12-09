const { expect } = require('chai');
const sinon = require('sinon');

const RolesService = require('../../services/RolesService');
const Roles = require('../../models/Roles');

describe('Pruebas Unitarias: RolesService', () => {

    afterEach(() => {
        sinon.restore();
    });

    describe('obtenerTodosLosRoles', () => {
        it('Debe retornar la lista de roles', async () => {
            const rolesFake = [{ id: 1, nombre: 'admin' }];
            sinon.stub(Roles, 'obtenerTodos').resolves(rolesFake);

            const resultado = await RolesService.obtenerTodosLosRoles();
            expect(resultado).to.deep.equal(rolesFake);
        });
    });

    describe('crearRol', () => {
        it('Debe crear un rol si el nombre es válido y no existe', async () => {
            const rolInput = { nombre: 'Vendedor' };
            const rolCreado = { id: 5, nombre: 'Vendedor' };

            // 1. Stub: Buscar por nombre retorna null (no existe)
            sinon.stub(Roles, 'obtenerPorNombre').resolves(null);
            // 2. Stub: Crear retorna ID
            sinon.stub(Roles, 'crear').resolves(5);
            // 3. Stub: Obtener por ID retorna el objeto completo
            sinon.stub(Roles, 'obtenerPorId').resolves(rolCreado);

            const resultado = await RolesService.crearRol(rolInput);
            expect(resultado).to.deep.equal(rolCreado);
        });

        it('Debe lanzar error si el nombre ya existe', async () => {
            const rolInput = { nombre: 'Admin' };
            
            // Stub: Ya existe un rol con ese nombre
            sinon.stub(Roles, 'obtenerPorNombre').resolves({ id: 1, nombre: 'Admin' });

            try {
                await RolesService.crearRol(rolInput);
            } catch (error) {
                // El servicio envuelve el error, así que buscamos "Ya existe" dentro del mensaje
                expect(error.message).to.include('Ya existe un rol con ese nombre');
            }
        });

        it('Debe lanzar error si el nombre es muy largo (>50)', async () => {
            const nombreLargo = 'a'.repeat(51);
            try {
                await RolesService.crearRol({ nombre: nombreLargo });
            } catch (error) {
                expect(error.message).to.include('no puede exceder los 50 caracteres');
            }
        });
    });

    describe('eliminarRol', () => {
        it('Debe eliminar un rol común correctamente', async () => {
            // Simulamos un rol que NO es protegido
            const rolComun = { id: 10, nombre: 'Visitante' };
            
            sinon.stub(Roles, 'obtenerPorId').resolves(rolComun);
            sinon.stub(Roles, 'eliminar').resolves(true);

            const resultado = await RolesService.eliminarRol(10);
            expect(resultado).to.have.property('mensaje', 'Rol eliminado correctamente');
        });

        it('Debe impedir eliminar roles protegidos (admin, empleado, cliente)', async () => {
            // Simulamos que el ID 1 es 'admin'
            const rolProtegido = { id: 1, nombre: 'admin' };
            sinon.stub(Roles, 'obtenerPorId').resolves(rolProtegido);

            try {
                await RolesService.eliminarRol(1);
            } catch (error) {
                expect(error.message).to.include('No se puede eliminar un rol predefinido');
            }
        });

        it('Debe lanzar error si el rol no existe', async () => {
            sinon.stub(Roles, 'obtenerPorId').resolves(null);

            try {
                await RolesService.eliminarRol(999);
            } catch (error) {
                expect(error.message).to.include('Rol no encontrado');
            }
        });
    });

    describe('actualizarRol', () => {
        it('Debe actualizar si el nombre es válido', async () => {
            const rolExistente = { id: 2, nombre: 'Viejo' };
            
            sinon.stub(Roles, 'obtenerPorId')
                .onFirstCall().resolves(rolExistente) // Verificación inicial
                .onSecondCall().resolves({ id: 2, nombre: 'Nuevo' }); // Retorno final

            // Validar unicidad: null significa que nadie más tiene ese nombre
            sinon.stub(Roles, 'obtenerPorNombre').resolves(null);
            sinon.stub(Roles, 'actualizar').resolves(true);

            const resultado = await RolesService.actualizarRol(2, { nombre: 'Nuevo' });
            expect(resultado.nombre).to.equal('Nuevo');
        });

        it('Debe lanzar error si el nuevo nombre ya lo usa otro rol', async () => {
            const rolAEditar = { id: 2, nombre: 'Editor' };
            // El nombre 'SuperAdmin' ya lo tiene el ID 1
            const rolConflicto = { id: 1, nombre: 'SuperAdmin' };

            sinon.stub(Roles, 'obtenerPorId').resolves(rolAEditar);
            sinon.stub(Roles, 'obtenerPorNombre').resolves(rolConflicto);

            try {
                await RolesService.actualizarRol(2, { nombre: 'SuperAdmin' });
            } catch (error) {
                expect(error.message).to.include('Ya existe otro rol con ese nombre');
            }
        });
    });
});