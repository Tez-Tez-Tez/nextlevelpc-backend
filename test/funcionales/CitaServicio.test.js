const chai = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();
const { expect } = chai;

describe('CitaServicio Integration Tests (Service -> Model -> DB)', () => {
    let citaServicioService;
    let supabaseStub;
    let queryBuilder;

    beforeEach(() => {
        // 1. Crear el Query Builder simulado
        queryBuilder = {
            select: sinon.stub(),
            insert: sinon.stub(),
            update: sinon.stub(),
            delete: sinon.stub(),
            eq: sinon.stub(),
            single: sinon.stub(),
            order: sinon.stub()
        };

        // Configuración BASE: permitir encadenamiento devolviendo 'this' (el propio builder)
        queryBuilder.select.returns(queryBuilder);
        queryBuilder.insert.returns(queryBuilder);
        queryBuilder.update.returns(queryBuilder);
        queryBuilder.delete.returns(queryBuilder); // Agregado explícitamente
        queryBuilder.eq.returns(queryBuilder);
        queryBuilder.order.returns(queryBuilder);
        
        // 2. Crear el Stub de Supabase Admin
        supabaseStub = {
            from: sinon.stub().returns(queryBuilder)
        };

        // 3. Cargar el Modelo con Proxyquire
        const CitaServicioModel = proxyquire('../../models/CitaServicio', {
            '../config/db': { supabaseAdmin: supabaseStub }
        });

        // 4. Cargar el Servicio con Proxyquire
        citaServicioService = proxyquire('../../services/CitaServicioService', {
            '../models/CitaServicio': CitaServicioModel
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('crear() - Integración de Creación', () => {
        it('debe normalizar los datos, insertarlos en DB y devolver el registro', async () => {
            const inputData = {
                servicio_id: 1,
                nombre: 'Juan Perez',
                email: 'juan@test.com',
                fecha: '2025-12-12'
            };

            const dbResponse = { 
                data: [{ id: 10, ...inputData, estado: 'pendiente' }], 
                error: null 
            };

            // Flujo: .insert().select() -> select devuelve la data
            queryBuilder.select.resolves(dbResponse);

            const resultado = await citaServicioService.crear(inputData);

            expect(supabaseStub.from.calledWith('citas_servicios')).to.be.true;
            expect(queryBuilder.insert.calledOnce).to.be.true;
            
            const argsInsert = queryBuilder.insert.firstCall.args[0];
            expect(argsInsert[0]).to.have.property('nombre_cliente', 'Juan Perez');
            expect(resultado).to.deep.equal(dbResponse.data[0]);
        });

        it('debe lanzar error si falta el email (Validación de Negocio en Servicio)', async () => {
            try {
                await citaServicioService.crear({ nombre: 'Sin Email' });
                throw new Error('Debería haber fallado');
            } catch (error) {
                expect(error.message).to.include('El correo electrónico es obligatorio');
                expect(supabaseStub.from.called).to.be.false;
            }
        });
    });

    describe('getAllCitas() - Integración de Lectura', () => {
        it('debe solicitar todas las citas ordenadas por fecha', async () => {
            const dbData = [{ id: 1, nombre_cliente: 'Ana' }];
            
            // Flujo: .select().order() -> order devuelve la data
            queryBuilder.order.resolves({ data: dbData, error: null });

            const resultado = await citaServicioService.getAllCitas();

            expect(queryBuilder.select.called).to.be.true;
            expect(queryBuilder.order.calledWith('created_at', { ascending: false })).to.be.true;
            expect(resultado).to.deep.equal(dbData);
        });
    });

    describe('updateCitaStatus() - Integración de Actualización', () => {
        it('debe actualizar el estado y luego devolver la cita actualizada', async () => {
            const idCita = 5;
            const nuevoEstado = 'confirmada';

            // AQUÍ ESTABA EL ERROR
            // El modelo hace dos llamadas a BD:
            // 1. Update: .update({}).eq('id', id)
            // 2. FindById: .select()...eq('id', id).single()

            // Configuración compleja para .eq():
            // Primera llamada a .eq (del update): debe resolver la promesa de actualización
            queryBuilder.eq.onFirstCall().resolves({ error: null });
            
            // Segunda llamada a .eq (del select/findById): debe devolver el builder para permitir .single()
            queryBuilder.eq.onSecondCall().returns(queryBuilder);

            // Configuración final de .single (del findById)
            queryBuilder.single.resolves({ 
                data: { id: idCita, estado: nuevoEstado }, 
                error: null 
            });

            const resultado = await citaServicioService.updateCitaStatus(idCita, nuevoEstado);

            expect(queryBuilder.update.calledWith({ estado: nuevoEstado })).to.be.true;
            // Validar que update fue seguido de eq
            expect(queryBuilder.eq.calledWith('id', idCita)).to.be.true;
            
            expect(resultado.estado).to.equal(nuevoEstado);
        });

        it('debe rechazar estados no válidos en el Servicio', async () => {
            try {
                await citaServicioService.updateCitaStatus(1, 'estado_invalido');
            } catch (error) {
                expect(error.message).to.equal('Estado no válido.');
                expect(queryBuilder.update.called).to.be.false;
            }
        });
    });

    describe('deleteCita() - Integración de Eliminación', () => {
        it('debe eliminar la cita por ID', async () => {
            const id = 99;
            
            // AQUÍ TAMBIÉN: Flujo .delete().eq()
            // .delete() ya devuelve 'this' (configurado en beforeEach)
            // .eq() es el final de la cadena, así que debe resolver la promesa
            queryBuilder.eq.resolves({ error: null });

            const resultado = await citaServicioService.deleteCita(id);

            expect(queryBuilder.delete.calledOnce).to.be.true;
            expect(queryBuilder.eq.calledWith('id', id)).to.be.true;
            expect(resultado).to.be.true;
        });
    });
});