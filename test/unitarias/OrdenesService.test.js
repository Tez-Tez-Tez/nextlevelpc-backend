const { expect } = require('chai');
const sinon = require('sinon');

const OrdenesService = require('../../services/OrdenesService');
const Ordenes = require('../../models/Ordenes');
const OrdenItems = require('../../models/OrdenItems');

describe('Pruebas Unitarias: OrdenesService', () => {

    afterEach(() => {
        sinon.restore();
    });

    describe('crear', () => {
        it('Debe crear una orden y retornar su ID', async () => {
            const dto = { cliente_id: 1, tipo: 'producto', total: 0 };
            const idCreado = 10;
            
            // Stub del modelo Ordenes
            sinon.stub(Ordenes, 'crear').resolves(idCreado);

            const resultado = await OrdenesService.crear(dto);
            expect(resultado).to.equal(idCreado);
        });

        it('Debe lanzar error si falla la creación en BD', async () => {
            sinon.stub(Ordenes, 'crear').rejects(new Error('Error DB'));
            
            try {
                await OrdenesService.crear({});
            } catch (error) {
                expect(error.message).to.include('Error al crear la orden');
            }
        });
    });

    describe('obtenerPorId', () => {
        it('Debe retornar la orden INCLUYENDO sus items', async () => {
            const ordenId = 1;
            const ordenFake = { id: ordenId, total: 100 };
            const itemsFake = [{ id: 1, subtotal: 50 }, { id: 2, subtotal: 50 }];

            // 1. Stub Ordenes.obtenerPorId
            sinon.stub(Ordenes, 'obtenerPorId').resolves(ordenFake);
            
            // 2. Stub OrdenItems.obtenerPorOrden (El servicio lo llama para rellenar la orden)
            sinon.stub(OrdenItems, 'obtenerPorOrden').resolves(itemsFake);

            const resultado = await OrdenesService.obtenerPorId(ordenId);

            expect(resultado).to.have.property('id', ordenId);
            expect(resultado).to.have.property('items'); // Verifica que se agregaron los items
            expect(resultado.items).to.deep.equal(itemsFake);
        });

        it('Debe lanzar error si la orden no existe', async () => {
            sinon.stub(Ordenes, 'obtenerPorId').resolves(null);
            
            try {
                await OrdenesService.obtenerPorId(999);
            } catch (error) {
                expect(error.message).to.include('Orden no encontrada');
            }
        });
    });

    describe('actualizarTotal', () => {
        it('Debe sumar los items y actualizar el total en la orden', async () => {
            const ordenId = 5;
            // Simulamos items con subtotales
            const itemsFake = [
                { subtotal: 10.50 },
                { subtotal: 20.50 }
            ];
            // Suma esperada: 31.00

            // 1. Stub obtener items
            sinon.stub(OrdenItems, 'obtenerPorOrden').resolves(itemsFake);
            
            // 2. Stub actualizar orden
            sinon.stub(Ordenes, 'actualizar').resolves(true);

            const totalCalculado = await OrdenesService.actualizarTotal(ordenId);

            expect(totalCalculado).to.equal(31);
            
            // Verificamos que se llamó a actualizar con el formato correcto (string con 2 decimales)
            expect(Ordenes.actualizar.calledWith(ordenId, { total: "31.00" })).to.be.true;
        });
    });

    describe('eliminar', () => {
        it('Debe eliminar la orden si existe', async () => {
            sinon.stub(Ordenes, 'obtenerPorId').resolves({ id: 1 });
            sinon.stub(Ordenes, 'eliminar').resolves(true);

            const res = await OrdenesService.eliminar(1);
            expect(res).to.be.true;
        });
    });
});