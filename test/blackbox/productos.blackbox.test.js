const { expect } = require('chai');
const sinon = require('sinon');
const ProductosController = require('../../controllers/ProductosController');
const ProductosService = require('../../services/ProductosService');

describe('Pruebas Caja Negra: ProductosController', () => {
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

    describe('GET /api/productos - obtenerTodosLosProductos', () => {
        it('Debe responder 200 con lista de productos', async () => {
            const mockProductos = [
                { id: 1, nombre: 'Laptop Gamer', precio: 1500 },
                { id: 2, nombre: 'Mouse RGB', precio: 50 }
            ];

            sinon.stub(ProductosService, 'obtenerTodosLosProductos').resolves(mockProductos);

            await ProductosController.obtenerTodosLosProductos(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.args[0][0].data).to.be.an('array');
            expect(jsonSpy.args[0][0].data).to.have.lengthOf(2);
        });
    });

    describe('GET /api/productos/:id - obtenerProductoPorId', () => {
        it('Debe responder 200 cuando el producto existe', async () => {
            req.params.id = '1';

            const mockProducto = {
                id: 1,
                nombre: 'Teclado Mecánico',
                precio: 120,
                stock: 50
            };

            sinon.stub(ProductosService, 'obtenerProductoPorId').resolves(mockProducto);

            await ProductosController.obtenerProductoPorId(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.args[0][0].data).to.have.property('nombre', 'Teclado Mecánico');
        });
    });

    describe('GET /api/productos/buscar - buscarProductos', () => {
        it('Debe responder 200 con resultados de búsqueda', async () => {
            req.query.q = 'Gamer';

            const mockResultados = [
                { id: 1, nombre: 'Silla Gamer', precio: 300 },
                { id: 2, nombre: 'Teclado Gamer', precio: 150 }
            ];

            sinon.stub(ProductosService, 'buscarProductos').resolves(mockResultados);

            await ProductosController.buscarProductos(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.args[0][0].data).to.have.lengthOf(2);
        });

        it('Debe responder 400 cuando no hay query', async () => {
            req.query = {};

            await ProductosController.buscarProductos(req, res);

            expect(statusStub.calledWith(400)).to.be.true;
        });
    });

    describe('POST /api/productos - crearProducto', () => {
        it('Debe responder 201 cuando se crea exitosamente', async () => {
            req.body = {
                nombre: 'Nuevo Producto',
                precio: 100,
                stock: 20,
                categoria_id: 1
            };

            const mockProducto = { id: 10, ...req.body };

            sinon.stub(ProductosService, 'crearProducto').resolves(mockProducto);

            await ProductosController.crearProducto(req, res);

            expect(statusStub.calledWith(201)).to.be.true;
            expect(jsonSpy.args[0][0]).to.have.property('message', 'Producto creado exitosamente');
        });
    });

    describe('PATCH /api/productos/:id - actualizarProducto', () => {
        it('Debe responder 200 cuando actualiza exitosamente', async () => {
            req.params.id = '1';
            req.body = { precio: 150 };

            sinon.stub(ProductosService, 'actualizarProducto').resolves(true);

            await ProductosController.actualizarProducto(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.args[0][0]).to.have.property('message', 'Producto actualizado exitosamente');
        });
    });

    describe('DELETE /api/productos/:id - eliminarProducto', () => {
        it('Debe responder 200 cuando elimina exitosamente', async () => {
            req.params.id = '1';

            sinon.stub(ProductosService, 'eliminarProducto').resolves({
                mensaje: 'Producto eliminado correctamente'
            });

            await ProductosController.eliminarProducto(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
        });
    });
});
