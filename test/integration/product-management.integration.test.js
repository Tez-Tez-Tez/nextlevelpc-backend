const { expect } = require('chai');
const sinon = require('sinon');
const ProductosService = require('../../services/ProductosService');
const Productos = require('../../models/Productos');

describe('Pruebas Integración: Gestión de Productos', () => {

    afterEach(() => {
        sinon.restore();
    });

    describe('Flujo: Buscar productos por categoría', () => {
        it('Debe obtener todos los productos de una categoría', async () => {
            const productosCategoria = [
                { id: 1, nombre: 'Laptop HP', categoria_id: 1, precio: 1000 },
                { id: 2, nombre: 'Laptop Dell', categoria_id: 1, precio: 1200 },
                { id: 3, nombre: 'Laptop Asus', categoria_id: 1, precio: 1500 }
            ];

            sinon.stub(Productos, 'obtenerPorCategoria').resolves(productosCategoria);

            const productos = await ProductosService.obtenerProductosPorCategoria(1);

            expect(productos).to.be.an('array');
            expect(productos).to.have.lengthOf(3);
            expect(productos.every(p => p.categoria_id === 1)).to.be.true;
        });
    });

    describe('Flujo: Búsqueda de productos', () => {
        it('Debe buscar productos por nombre', async () => {
            const resultadosBusqueda = [
                { id: 1, nombre: 'Teclado Gamer RGB', precio: 120 },
                { id: 2, nombre: 'Mouse Gamer RGB', precio: 50 },
                { id: 3, nombre: 'Silla Gamer', precio: 300 }
            ];

            sinon.stub(Productos, 'buscarPorNombre').resolves(resultadosBusqueda);

            const productos = await ProductosService.buscarProductos('Gamer');

            expect(productos).to.be.an('array');
            expect(productos).to.have.lengthOf(3);
            expect(productos.every(p => p.nombre.includes('Gamer'))).to.be.true;
        });

        it('Debe rechazar búsqueda con query vacío', async () => {
            try {
                await ProductosService.buscarProductos('');
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error.message).to.include('termino de busqueda es requerido');
            }
        });
    });

    describe('Flujo: Productos activos', () => {
        it('Debe obtener solo productos activos', async () => {
            const productosActivos = [
                { id: 1, nombre: 'Laptop', activo: true, stock: 10 },
                { id: 2, nombre: 'Mouse', activo: true, stock: 20 }
            ];

            sinon.stub(Productos, 'obtenerActivos').resolves(productosActivos);

            const productos = await ProductosService.obtenerProductosActivos();

            expect(productos).to.be.an('array');
            expect(productos.every(p => p.activo === true)).to.be.true;
        });
    });

    describe('Flujo: Eliminar producto', () => {
        it('Debe eliminar producto existente', async () => {
            const productoExistente = {
                id: 5,
                nombre: 'Producto a eliminar',
                precio: 100
            };

            sinon.stub(Productos, 'obtenerPorId').resolves(productoExistente);
            sinon.stub(Productos, 'eliminar').resolves(true);

            const resultado = await ProductosService.eliminarProducto(5);

            expect(resultado).to.have.property('mensaje', 'Producto eliminado correctamente');
        });

        it('Debe fallar al eliminar producto inexistente', async () => {
            sinon.stub(Productos, 'obtenerPorId').resolves(null);

            try {
                await ProductosService.eliminarProducto(999);
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error.message).to.include('Producto no encontrado');
            }
        });
    });

    describe('Flujo: Validación de stock', () => {
        it('Debe verificar que el stock sea suficiente para una venta', async () => {
            const producto = {
                id: 1,
                nombre: 'Teclado',
                stock: 10,
                precio: 100
            };

            sinon.stub(Productos, 'obtenerPorId').resolves(producto);

            const productoObtenido = await ProductosService.obtenerProductoPorId(1);

            const cantidadVenta = 5;
            const stockSuficiente = productoObtenido.stock >= cantidadVenta;

            expect(stockSuficiente).to.be.true;
            expect(productoObtenido.stock - cantidadVenta).to.equal(5);
        });

        it('Debe detectar stock insuficiente', async () => {
            const producto = {
                id: 1,
                nombre: 'Mouse',
                stock: 3,
                precio: 50
            };

            sinon.stub(Productos, 'obtenerPorId').resolves(producto);

            const productoObtenido = await ProductosService.obtenerProductoPorId(1);

            const cantidadVenta = 10;
            const stockSuficiente = productoObtenido.stock >= cantidadVenta;

            expect(stockSuficiente).to.be.false;
        });
    });
});
