const { expect } = require('chai');
const sinon = require('sinon');
const ordenesService = require('../../services/OrdenesService');
const ordenItemsService = require('../../services/OrdenItemsService');
const ProductosService = require('../../services/ProductosService');
const Ordenes = require('../../models/Ordenes');
const OrdenItems = require('../../models/OrdenItems');
const Productos = require('../../models/Productos');

describe('Pruebas Integración: Flujo de Creación de Orden', () => {

    afterEach(() => {
        sinon.restore();
    });

    describe('Flujo completo: Obtener Productos → Crear Orden → Agregar Items → Calcular Total', () => {
        it('Debe completar el flujo de creación de orden exitosamente', async () => {
            const productosDisponibles = [
                { id: 1, nombre: 'Laptop', precio: 1000, stock: 10 },
                { id: 2, nombre: 'Mouse', precio: 50, stock: 20 }
            ];

            sinon.stub(Productos, 'obtenerTodos').resolves(productosDisponibles);

            const productos = await ProductosService.obtenerTodosLosProductos();
            expect(productos).to.have.lengthOf(2);

            const ordenData = {
                cliente_id: 1,
                total: 0,
                estado: 'pendiente',
                metodo_pago: 'tarjeta'
            };

            sinon.stub(Ordenes, 'crear').resolves(1);
            const ordenId = await ordenesService.crear(ordenData);
            expect(ordenId).to.equal(1);

            const items = [
                { orden_id: 1, producto_id: 1, cantidad: 1, precio_unitario: 1000, subtotal: 1000 },
                { orden_id: 1, producto_id: 2, cantidad: 2, precio_unitario: 50, subtotal: 100 }
            ];

            sinon.stub(OrdenItems, 'obtenerPorOrden').resolves(items);
            sinon.stub(Ordenes, 'actualizar').resolves(true);

            const total = await ordenesService.actualizarTotal(1);
            expect(total).to.equal(1100);
        });
    });

    describe('Flujo: Validación de stock antes de crear orden', () => {
        it('Debe verificar que hay stock suficiente', async () => {
            const producto = { id: 1, nombre: 'Laptop', stock: 10, precio: 1000 };
            sinon.stub(Productos, 'obtenerPorId').resolves(producto);

            const productoObtenido = await ProductosService.obtenerProductoPorId(1);
            const cantidadSolicitada = 5;

            expect(productoObtenido.stock).to.be.at.least(cantidadSolicitada);
        });

        it('Debe fallar si no hay stock suficiente', async () => {
            const producto = { id: 1, nombre: 'Laptop', stock: 2, precio: 1000 };
            sinon.stub(Productos, 'obtenerPorId').resolves(producto);

            const productoObtenido = await ProductosService.obtenerProductoPorId(1);
            const cantidadSolicitada = 10;

            expect(productoObtenido.stock).to.be.lessThan(cantidadSolicitada);
        });
    });

    describe('Flujo: Obtener órdenes por cliente', () => {
        it('Debe obtener todas las órdenes de un cliente', async () => {
            const ordenesCliente = [
                { id: 1, cliente_id: 1, total: 500 },
                { id: 2, cliente_id: 1, total: 300 }
            ];

            sinon.stub(Ordenes, 'obtenerPorCliente').resolves(ordenesCliente);

            const ordenes = await ordenesService.obtenerPorCliente(1);
            expect(ordenes).to.have.lengthOf(2);
            expect(ordenes.every(o => o.cliente_id === 1)).to.be.true;
        });

        it('Debe retornar array vacío si el cliente no tiene órdenes', async () => {
            sinon.stub(Ordenes, 'obtenerPorCliente').resolves([]);

            const ordenes = await ordenesService.obtenerPorCliente(999);
            expect(ordenes).to.be.an('array').that.is.empty;
        });
    });

    describe('Flujo: Cálculo de subtotales en items', () => {
        it('Debe calcular correctamente el subtotal de cada item', async () => {
            const items = [
                { producto_id: 1, cantidad: 2, precio_unitario: 500 },
                { producto_id: 2, cantidad: 3, precio_unitario: 100 }
            ];

            const itemsConSubtotal = items.map(item => ({
                ...item,
                subtotal: item.cantidad * item.precio_unitario
            }));

            expect(itemsConSubtotal[0].subtotal).to.equal(1000);
            expect(itemsConSubtotal[1].subtotal).to.equal(300);
        });
    });
});
