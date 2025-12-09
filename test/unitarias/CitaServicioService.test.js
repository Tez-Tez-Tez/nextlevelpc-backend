const { expect } = require('chai');
const sinon = require('sinon');

const CitaServicioService = require('../../services/CitaServicioService');
const CitaServicio = require('../../models/CitaServicio');

describe('Pruebas Unitarias: CitaServicioService', () => {

    afterEach(() => {
        sinon.restore();
    });

    describe('createCita', () => {
        it('Debe crear la cita si los datos son válidos', async () => {
            const data = { email: 'test@test.com', servicio_id: 1 };
            const citaCreada = { id: 1, ...data };
            
            sinon.stub(CitaServicio, 'create').resolves(citaCreada);

            const resultado = await CitaServicioService.createCita(data);
            expect(resultado).to.deep.equal(citaCreada);
        });

        it('Debe lanzar error si falta el email', async () => {
            try {
                await CitaServicioService.createCita({ servicio_id: 1 });
            } catch (error) {
                expect(error.message).to.equal('El correo electrónico es obligatorio.');
            }
        });
    });

    describe('updateCitaStatus', () => {
        it('Debe actualizar si el estado es válido', async () => {
            const id = 1;
            const estado = 'confirmada';
            
            sinon.stub(CitaServicio, 'updateStatus').resolves({ id, estado });

            const resultado = await CitaServicioService.updateCitaStatus(id, estado);
            expect(resultado.estado).to.equal(estado);
        });

        it('Debe lanzar error si el estado no es válido', async () => {
            try {
                await CitaServicioService.updateCitaStatus(1, 'inventado');
            } catch (error) {
                expect(error.message).to.equal('Estado no válido.');
            }
        });
    });

    describe('actualizarEstadoPago', () => {
        it('Debe actualizar el pago si el estado es válido', async () => {
            const id = 1;
            const estadoPago = 'pagado';
            
            sinon.stub(CitaServicio, 'updateEstadoPago').resolves({ id, estado_pago: estadoPago });

            const resultado = await CitaServicioService.actualizarEstadoPago(id, estadoPago);
            expect(resultado.estado_pago).to.equal(estadoPago);
        });

        it('Debe lanzar error si el estado de pago no es válido', async () => {
            try {
                await CitaServicioService.actualizarEstadoPago(1, 'gratis');
            } catch (error) {
                expect(error.message).to.equal('Estado de pago no válido.');
            }
        });
    });

    describe('obtenerPorId', () => {
        it('Debe retornar la cita si existe', async () => {
            const cita = { id: 10 };
            sinon.stub(CitaServicio, 'findById').resolves(cita);

            const resultado = await CitaServicioService.obtenerPorId(10);
            expect(resultado).to.equal(cita);
        });

        it('Debe lanzar error si no se envía ID', async () => {
            try {
                await CitaServicioService.obtenerPorId(null);
            } catch (error) {
                expect(error.message).to.include('requerido');
            }
        });
    });

    describe('actualizar', () => {
        it('Debe llamar al modelo para actualizar', async () => {
            const id = 1;
            const data = { nombre: 'Test' };
            sinon.stub(CitaServicio, 'actualizar').resolves({ id, ...data });

            const resultado = await CitaServicioService.actualizar(id, data);
            expect(resultado.nombre).to.equal('Test');
        });

        it('Debe lanzar error sin ID', async () => {
            try {
                await CitaServicioService.actualizar(null, {});
            } catch (error) {
                expect(error.message).to.include('requerido');
            }
        });
    });

    describe('deleteCita', () => {
        it('Debe eliminar correctamente', async () => {
            sinon.stub(CitaServicio, 'delete').resolves(true);
            const res = await CitaServicioService.deleteCita(5);
            expect(res).to.be.true;
        });

        it('Debe lanzar error sin ID', async () => {
            try {
                await CitaServicioService.deleteCita(null);
            } catch (error) {
                expect(error.message).to.include('requerido');
            }
        });
    });
});