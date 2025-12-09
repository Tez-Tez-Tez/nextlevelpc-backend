const { expect } = require('chai');
const sinon = require('sinon');

const OrdenItemsService = require('../../services/OrdenItemsService');
const OrdenItems = require('../../models/OrdenItems');
const OrdenesService = require('../../services/OrdenesService');

describe('Pruebas Unitarias: OrdenItemsService', () => {

    afterEach(() => {
        sinon.restore();
    });

    describe('crear', () => {
        it('Debe crear un item y actualizar el total de la orden', async () => {
            const itemInput = {
                orden_id: 1,
                tipo: 'producto',
                descripcion: 'Mouse',
                precio_unitario: 50,
                cantidad: 2
            };

            const itemGuardado = { id: 10, ...itemInput, subtotal: 100 };

            // 1. Stub: OrdenesService.actualizarTotal (para que no falle al intentar recalcular)
            sinon.stub(OrdenesService, 'actualizarTotal').resolves(true);

            // 2. Stub: Crear en BD devuelve ID
            sinon.stub(OrdenItems, 'crear').resolves(10);

            // 3. Stub: Obtener el item completo recien creado
            sinon.stub(OrdenItems, 'obtenerPorId').resolves(itemGuardado);

            const resultado = await OrdenItemsService.crear(itemInput);

            expect(resultado).to.have.property('id', 10);
            expect(resultado.subtotal).to.equal(100);
            // Verificamos que se llamó a actualizarTotal
            expect(OrdenesService.actualizarTotal.calledOnce).to.be.true;
        });

        it('Debe lanzar error si faltan datos obligatorios (Validación DTO)', async () => {
            const itemIncompleto = { orden_id: 1 }; // Falta precio, tipo, etc.

            try {
                await OrdenItemsService.crear(itemIncompleto);
            } catch (error) {
                expect(error.message).to.include('Errores al crear orden-item');
            }
        });
    });

    describe('obtenerPorOrden', () => {
        it('Debe retornar los items de una orden', async () => {
            const itemsFake = [
                { id: 1, descripcion: 'Item 1', orden_id: 5 },
                { id: 2, descripcion: 'Item 2', orden_id: 5 }
            ];

            sinon.stub(OrdenItems, 'obtenerPorOrden').resolves(itemsFake);

            const resultado = await OrdenItemsService.obtenerPorOrden(5);

            expect(resultado).to.have.lengthOf(2);
            expect(resultado[0].descripcion).to.equal('Item 1');
        });
    });

    describe('actualizar', () => {
        it('Debe actualizar el item si existe', async () => {
            const idItem = 1;
            const dataUpdate = { cantidad: 5 };
            const itemExistente = { id: 1, cantidad: 1, precio_unitario: 10 };

            // 1. Stub: Verificar existencia (se llama a this.obtenerPorId -> OrdenItems.obtenerPorId)
            // IMPORTANTE: Como el servicio llama a `OrdenItemsService.obtenerPorId`, mockeamos el modelo directo
            sinon.stub(OrdenItems, 'obtenerPorId').resolves(itemExistente);

            // 2. Stub: Actualizar en BD
            sinon.stub(OrdenItems, 'actualizar').resolves({ ...itemExistente, cantidad: 5 });

            const resultado = await OrdenItemsService.actualizar(idItem, dataUpdate);

            expect(resultado.cantidad).to.equal(5);
        });

        it('Debe lanzar error si el item no existe', async () => {
            sinon.stub(OrdenItems, 'obtenerPorId').resolves(null);

            try {
                await OrdenItemsService.actualizar(999, { cantidad: 2 });
            } catch (error) {
                expect(error.message).to.include('Item no encontrado');
            }
        });
    });

    describe('eliminar', () => {
        it('Debe eliminar el item si existe', async () => {
            sinon.stub(OrdenItems, 'obtenerPorId').resolves({ id: 5 });
            sinon.stub(OrdenItems, 'eliminar').resolves(true);

            const resultado = await OrdenItemsService.eliminar(5);
            expect(resultado).to.be.true;
        });
    });
});