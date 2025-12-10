const { expect } = require('chai');
const sinon = require('sinon');

const ProductosController = require('../../controllers/ProductosController');
const ProductosService = require('../../services/ProductosService');

describe('Pruebas Funcionales: Productos', () => {
    let req, res, statusStub, jsonSpy;

    beforeEach(() => {
        statusStub = sinon.stub();
        jsonSpy = sinon.spy();

        req = {
            body: {},
            params: {},
            query: {}
        };

        res = {
            status: statusStub.returns({ json: jsonSpy }),
            json: jsonSpy
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('Gestión Completa de Productos', () => {
        it('Listar Productos: Debe retornar todos los productos', async () => {
            const mockProductos = [
                { id: 1, nombre: 'RTX 4090', precio: 1500, stock: 5 },
                { id: 2, nombre: 'Ryzen 9 7950X', precio: 700, stock: 10 },
                { id: 3, nombre: 'RAM DDR5 32GB', precio: 200, stock: 20 }
            ];

            sinon.stub(ProductosService, 'obtenerTodosLosProductos').resolves(mockProductos);

            await ProductosController.obtenerTodosLosProductos(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.args[0][0].data).to.have.lengthOf(3);
        });

        it('Crear Producto: Debe crear un producto correctamente', async () => {
            req.body = {
                nombre: 'Intel i9-14900K',
                descripcion: 'Procesador de última generación',
                precio: 600,
                stock: 15,
                categoria_id: 1
            };

            const productoCreado = { id: 50, ...req.body };
            sinon.stub(ProductosService, 'crearProducto').resolves(productoCreado);

            await ProductosController.crearProducto(req, res);

            expect(statusStub.calledWith(201)).to.be.true;
            expect(jsonSpy.args[0][0]).to.have.property('message', 'Producto creado exitosamente');
        });

        it('Crear Producto: Debe rechazar si falta el nombre', async () => {
            req.body = { precio: 100, stock: 5 }; // Falta nombre

            sinon.stub(ProductosService, 'crearProducto').rejects(new Error('Erroes de validación: nombre es requerido'));

            await ProductosController.crearProducto(req, res);

            expect(statusStub.calledWith(400)).to.be.true;
        });

        it('Obtener Producto por ID: Debe retornar el producto si existe', async () => {
            req.params.id = 1;
            const mockProducto = {
                id: 1,
                nombre: 'RTX 4090',
                precio: 1500,
                stock: 5
            };

            sinon.stub(ProductosService, 'obtenerProductoPorId').resolves(mockProducto);

            await ProductosController.obtenerProductoPorId(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.args[0][0].data).to.have.property('nombre', 'RTX 4090');
        });

        it('Obtener Producto por ID: Debe retornar 500 si no existe', async () => {
            req.params.id = 999;
            sinon.stub(ProductosService, 'obtenerProductoPorId').rejects(new Error('Producto no encontrado'));

            await ProductosController.obtenerProductoPorId(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
        });

        it('Actualizar Producto: Debe actualizar stock y precio', async () => {
            req.params.id = 1;
            req.body = { precio: 1400, stock: 8 };

            const productoActualizado = { id: 1, nombre: 'RTX 4090', precio: 1400, stock: 8 };
            sinon.stub(ProductosService, 'actualizarProducto').resolves(productoActualizado);

            await ProductosController.actualizarProducto(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
        });

        it('Eliminar Producto: Debe eliminar correctamente', async () => {
            req.params.id = 1;
            sinon.stub(ProductosService, 'eliminarProducto').resolves({ mensaje: 'Producto eliminado correctamente' });

            await ProductosController.eliminarProducto(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
        });
    });

    describe('Búsqueda y Filtrado', () => {
        it('Buscar por Categoría: Debe filtrar productos por categoría', async () => {
            req.params.categoria_id = 1;

            const mockProductos = [
                { id: 1, nombre: 'RTX 4090', categoria_id: 1 },
                { id: 2, nombre: 'RTX 4080', categoria_id: 1 }
            ];

            sinon.stub(ProductosService, 'obtenerProductosPorCategoria').resolves(mockProductos);

            await ProductosController.obtenerProductosPorCategoria(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.args[0][0].data).to.have.lengthOf(2);
        });

        it('Buscar por Nombre: Debe encontrar productos por nombre', async () => {
            req.query.q = 'RTX';

            const mockProductos = [
                { id: 1, nombre: 'RTX 4090' },
                { id: 2, nombre: 'RTX 4080' }
            ];

            sinon.stub(ProductosService, 'buscarProductos').resolves(mockProductos);

            await ProductosController.buscarProductos(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.args[0][0].data.length).to.be.greaterThan(0);
        });
    });

    describe('Validaciones de Stock', () => {
        it('No debe permitir stock negativo', async () => {
            req.body = { nombre: 'Test', precio: 100, stock: -5 };

            sinon.stub(ProductosService, 'crearProducto').rejects(new Error('Erroes de validación: stock debe ser mayor o igual a 0'));

            await ProductosController.crearProducto(req, res);

            expect(statusStub.calledWith(400)).to.be.true;
        });

        it('No debe permitir precio negativo', async () => {
            req.body = { nombre: 'Test', precio: -100, stock: 5 };

            sinon.stub(ProductosService, 'crearProducto').rejects(new Error('Erroes de validación: precio debe ser mayor a 0'));

            await ProductosController.crearProducto(req, res);

            expect(statusStub.calledWith(400)).to.be.true;
        });
    });
});
