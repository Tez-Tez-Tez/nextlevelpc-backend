const { expect } = require('chai');
const sinon = require('sinon');

const ProductosController = require('../../controllers/ProductosController');
const ProductosService = require('../../services/ProductosService');

describe('Pruebas Unitarias: ProductosController', () => {
    let req, res, statusStub, jsonSpy;

    // Configuración antes de cada test
    beforeEach(() => {
        statusStub = sinon.stub();
        jsonSpy = sinon.spy();
        
        // Simulamos los objetos req y res de Express
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

    describe('obtenerTodosLosProductos', () => {
        it('Debe responder con status 200 y la lista de productos', async () => {
            const listaProductos = [{ id: 1, nombre: 'Monitor' }];
            
            // Stub del Servicio: No llamamos a la lógica real, solo simulamos retorno
            sinon.stub(ProductosService, 'obtenerTodosLosProductos').resolves(listaProductos);

            await ProductosController.obtenerTodosLosProductos(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.calledWith({
                success: true,
                data: listaProductos
            })).to.be.true;
        });

        it('Debe responder con status 500 si el servicio falla', async () => {
            sinon.stub(ProductosService, 'obtenerTodosLosProductos').rejects(new Error('Fallo crítico'));

            await ProductosController.obtenerTodosLosProductos(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
            expect(jsonSpy.calledOnce).to.be.true;
        });
    });

    describe('crearProducto', () => {
        it('Debe responder 201 cuando se crea exitosamente', async () => {
            req.body = { nombre: 'Nuevo Item', precio: 50 };
            const productoCreado = { id: 10, ...req.body };

            sinon.stub(ProductosService, 'crearProducto').resolves(productoCreado);

            await ProductosController.crearProducto(req, res);

            expect(statusStub.calledWith(201)).to.be.true;
            expect(jsonSpy.args[0][0]).to.have.property('message', 'Producto creado exitosamente');
        });

        it('Debe responder 400 cuando hay error de validación', async () => {
            req.body = {}; // Body vacío
            sinon.stub(ProductosService, 'crearProducto').rejects(new Error('Datos inválidos'));

            await ProductosController.crearProducto(req, res);

            expect(statusStub.calledWith(400)).to.be.true;
            expect(jsonSpy.args[0][0].success).to.be.false;
        });
    });
});