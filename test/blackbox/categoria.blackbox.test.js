const { expect } = require('chai');
const sinon = require('sinon');
const CategoriaController = require('../../controllers/CategoriaController');
const categoriaService = require('../../services/CategoriaService');

describe('Pruebas Caja Negra: CategoriaController', () => {
    let req, res, statusStub, jsonSpy;

    beforeEach(() => {
        statusStub = sinon.stub();
        jsonSpy = sinon.spy();

        req = {
            body: {},
            params: {}
        };

        res = {
            status: statusStub.returns({ json: jsonSpy }),
            json: jsonSpy
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('GET /api/categorias - getCategorias', () => {
        it('Debe responder con lista de categorías', async () => {
            const mockCategorias = [
                { id: 1, nombre: 'Laptops', tipo: 'producto' },
                { id: 2, nombre: 'Periféricos', tipo: 'producto' }
            ];

            sinon.stub(categoriaService, 'getAllCategorias').resolves(mockCategorias);

            await CategoriaController.getCategorias(req, res);

            expect(jsonSpy.calledWith(mockCategorias)).to.be.true;
        });

        it('Debe responder 500 cuando hay error', async () => {
            sinon.stub(categoriaService, 'getAllCategorias').rejects(new Error('Error de BD'));

            await CategoriaController.getCategorias(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
        });
    });

    describe('GET /api/categorias/:id - getCategoria', () => {
        it('Debe responder con la categoría cuando existe', async () => {
            req.params.id = '1';

            const mockCategoria = { id: 1, nombre: 'Laptops', tipo: 'producto' };
            sinon.stub(categoriaService, 'getCategoriaById').resolves(mockCategoria);

            await CategoriaController.getCategoria(req, res);

            expect(jsonSpy.calledWith(mockCategoria)).to.be.true;
        });

        it('Debe responder 404 cuando no existe', async () => {
            req.params.id = '999';

            sinon.stub(categoriaService, 'getCategoriaById').resolves(null);

            await CategoriaController.getCategoria(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
        });
    });

    describe('POST /api/categorias - createCategoria', () => {
        it('Debe responder 201 cuando se crea exitosamente', async () => {
            req.body = { nombre: 'Nueva Categoría', tipo: 'producto' };

            const mockCategoria = { id: 10, nombre: 'Nueva Categoría', tipo: 'producto' };
            sinon.stub(categoriaService, 'createCategoria').resolves(mockCategoria);

            await CategoriaController.createCategoria(req, res);

            expect(statusStub.calledWith(201)).to.be.true;
            expect(jsonSpy.args[0][0]).to.have.property('message', 'Categoría creada correctamente');
        });

        it('Debe responder 400 cuando hay error de validación', async () => {
            req.body = {};

            sinon.stub(categoriaService, 'createCategoria').rejects(new Error('Nombre es requerido'));

            await CategoriaController.createCategoria(req, res);

            expect(statusStub.calledWith(400)).to.be.true;
        });
    });

    describe('PATCH /api/categorias/:id - updateCategoria', () => {
        it('Debe responder 200 cuando actualiza exitosamente', async () => {
            req.params.id = '1';
            req.body = { nombre: 'Categoría Actualizada' };

            const mockCategoria = { id: 1, nombre: 'Categoría Actualizada', tipo: 'producto' };
            sinon.stub(categoriaService, 'updateCategoria').resolves(mockCategoria);

            await CategoriaController.updateCategoria(req, res);

            expect(jsonSpy.args[0][0]).to.have.property('message', 'Categoría actualizada correctamente');
        });
    });

    describe('DELETE /api/categorias/:id - deleteCategoria', () => {
        it('Debe responder 200 cuando elimina exitosamente', async () => {
            req.params.id = '1';

            sinon.stub(categoriaService, 'deleteCategoria').resolves(true);

            await CategoriaController.deleteCategoria(req, res);

            expect(jsonSpy.args[0][0]).to.have.property('message', 'Categoría eliminada correctamente');
        });
    });
});
