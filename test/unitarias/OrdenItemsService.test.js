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
            const item = { 
                orden_id: 1, 
                tipo: 'producto', 
                producto_id: 101,
                descripcion: 'Mouse', 
                precio_unitario: 50, 
                cantidad: 2 
            };
            
            sinon.stub(OrdenesService, 'actualizarTotal').resolves(true);
            sinon.stub(OrdenItems, 'crear').resolves(10);
            
            // Simulamos que la BD devuelve el subtotal calculado como string '100.00'
            const itemCreado = { 
                id: 10, 
                ...item, 
                subtotal: '100.00' 
            };
            sinon.stub(OrdenItems, 'obtenerPorId').resolves(itemCreado);

            const resultado = await OrdenItemsService.crear(item);

            expect(resultado).to.have.property('id', 10);
            
            // CORRECCIÓN: Convertir a Number o comparar como string
            // Opción A: Comparar como string
            expect(resultado.subtotal).to.equal('100.00'); 
            
            // O Opción B (más flexible): Convertir ambos a float
            // expect(parseFloat(resultado.subtotal)).to.equal(100); 

            expect(OrdenesService.actualizarTotal.calledWith(1)).to.be.true;
        });

        it('Debe lanzar error si faltan datos obligatorios (Validación DTO)', async () => {
            const itemIncompleto = { orden_id: 1 };

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

            sinon.stub(OrdenItems, 'obtenerPorId').resolves(itemExistente);
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