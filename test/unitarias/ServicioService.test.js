const { expect } = require('chai');
const sinon = require('sinon');

// Importamos Servicio y Modelo
const ServicioService = require('../../services/ServicioService');
const Servicio = require('../../models/Servicio');

describe('Pruebas Unitarias: ServicioService', () => {

    afterEach(() => {
        sinon.restore();
    });

    describe('getAllServicios', () => {
        it('Debe retornar todos los servicios', async () => {
            const serviciosFake = [{ id: 1, nombre: 'Formateo' }];
            sinon.stub(Servicio, 'findAll').resolves(serviciosFake);

            const resultado = await ServicioService.getAllServicios();
            expect(resultado).to.deep.equal(serviciosFake);
        });

        it('Debe lanzar error si falla el modelo', async () => {
            sinon.stub(Servicio, 'findAll').rejects(new Error('Error DB'));

            try {
                await ServicioService.getAllServicios();
            } catch (error) {
                expect(error.message).to.include('Error al obtener servicios');
            }
        });
    });

    describe('createServicio', () => {
        // NOTA: Asegúrate de que createServicio sea 'static' en tu clase ServicioService
        
        it('Debe crear un servicio si no existe y los datos son válidos', async () => {
            const dataInput = { nombre: 'Limpieza', precio: 50, tipo: 'basico' };
            const servicioCreado = { id: 1, ...dataInput };

            // 1. Stub: Buscar por nombre retorna null (no existe)
            sinon.stub(Servicio, 'findByNombre').resolves(null);
            
            // 2. Stub: Crear retorna el servicio
            sinon.stub(Servicio, 'create').resolves(servicioCreado);

            const resultado = await ServicioService.createServicio(dataInput);

            expect(resultado).to.deep.equal(servicioCreado);
        });

        it('Debe lanzar error si ya existe un servicio con ese nombre', async () => {
            const dataInput = { nombre: 'Duplicado', precio: 50 };

            // Stub: Buscar por nombre retorna un objeto (ya existe)
            sinon.stub(Servicio, 'findByNombre').resolves({ id: 1, nombre: 'Duplicado' });

            try {
                await ServicioService.createServicio(dataInput);
            } catch (error) {
                expect(error.message).to.equal('Error al crear servicio: Ya existe un servicio con ese nombre');
            }
        });
    });

    describe('getServicioById', () => {
        it('Debe retornar el servicio si existe', async () => {
            const servicioFake = { id: 10, nombre: 'Test' };
            sinon.stub(Servicio, 'findById').resolves(servicioFake);

            const resultado = await ServicioService.getServicioById(10);
            expect(resultado).to.equal(servicioFake);
        });

        it('Debe lanzar error si no existe', async () => {
            sinon.stub(Servicio, 'findById').resolves(null);

            try {
                await ServicioService.getServicioById(999);
            } catch (error) {
                expect(error.message).to.include('Servicio no encontrado');
            }
        });
    });

    describe('updateServicio', () => {
        it('Debe actualizar el servicio correctamente', async () => {
            const id = 1;
            const dataUpdate = { nombre: 'Nuevo Nombre', precio: 100 };
            const servicioExistente = { id: 1, nombre: 'Viejo', precio: 50 };
            
            // 1. Stub: El servicio existe
            sinon.stub(Servicio, 'findById')
                .onFirstCall().resolves(servicioExistente) // Antes de update
                .onSecondCall().resolves({ ...servicioExistente, ...dataUpdate }); // Despues de update

            // 2. Stub: Validar nombre único (retorna null, nadie mas tiene ese nombre)
            sinon.stub(Servicio, 'findByNombre').resolves(null);

            // 3. Stub: Update
            sinon.stub(Servicio, 'update').resolves({ ...servicioExistente, ...dataUpdate });

            const resultado = await ServicioService.updateServicio(id, dataUpdate);

            expect(resultado.nombre).to.equal('Nuevo Nombre');
        });

        it('Debe lanzar error si el servicio a actualizar no existe', async () => {
            sinon.stub(Servicio, 'findById').resolves(null);

            try {
                await ServicioService.updateServicio(999, {});
            } catch (error) {
                expect(error.message).to.include('Servicio no encontrado');
            }
        });
    });

    describe('deleteServicio', () => {
        it('Debe eliminar si existe', async () => {
            sinon.stub(Servicio, 'findById').resolves({ id: 1 });
            sinon.stub(Servicio, 'delete').resolves(true);

            const resultado = await ServicioService.deleteServicio(1);
            expect(resultado).to.have.property('message', 'Servicio eliminado correctamente');
        });
    });
});