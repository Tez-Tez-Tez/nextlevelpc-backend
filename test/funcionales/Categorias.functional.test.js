const { expect } = require('chai');
const sinon = require('sinon');

const CategoriaController = require('../../controllers/CategoriaController');
const CategoriaService = require('../../services/CategoriaService');

describe('Pruebas Funcionales: Categorias', () => {
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

    describe('Gestión Completa de Categorías', () => {
        it('Listar Categorías: Debe obtener todas las categorías', async () => {
            const mockCats = [
                { id: 1, nombre: 'GPU', tipo: 'producto' },
                { id: 2, nombre: 'CPU', tipo: 'producto' },
                { id: 3, nombre: 'Mantenimiento', tipo: 'servicio' }
            ];
            sinon.stub(CategoriaService, 'getAllCategorias').resolves(mockCats);

            await CategoriaController.getCategorias(req, res);

            expect(jsonSpy.calledWith(mockCats)).to.be.true;
        });

        it('Crear Categoría: Debe crear categoría de producto', async () => {
            req.body = { nombre: 'RAM', tipo: 'producto' };
            const created = { id: 5, ...req.body };

            sinon.stub(CategoriaService, 'createCategoria').resolves(created);

            await CategoriaController.createCategoria(req, res);

            expect(statusStub.calledWith(201)).to.be.true;
            expect(jsonSpy.args[0][0]).to.include({ message: "Categoría creada correctamente" });
        });

        it('Crear Categoría: Debe crear categoría de servicio', async () => {
            req.body = { nombre: 'Reparación', tipo: 'servicio' };
            const created = { id: 6, ...req.body };

            sinon.stub(CategoriaService, 'createCategoria').resolves(created);

            await CategoriaController.createCategoria(req, res);

            expect(statusStub.calledWith(201)).to.be.true;
        });

        it('Crear Categoría: Debe rechazar duplicados (400)', async () => {
            req.body = { nombre: 'GPU', tipo: 'producto' };
            sinon.stub(CategoriaService, 'createCategoria').rejects(new Error('Ya existe una categoría'));

            await CategoriaController.createCategoria(req, res);

            expect(statusStub.calledWith(400)).to.be.true;
        });

        it('Obtener Categoría por ID: Debe retornar la categoría si existe', async () => {
            req.params.id = 1;
            const mockCat = { id: 1, nombre: 'GPU', tipo: 'producto' };

            sinon.stub(CategoriaService, 'getCategoriaById').resolves(mockCat);

            await CategoriaController.getCategoria(req, res);

            expect(jsonSpy.calledWith(mockCat)).to.be.true;
        });

        it('Obtener Categoría por ID: Debe retornar 404 si no existe', async () => {
            req.params.id = 999;
            sinon.stub(CategoriaService, 'getCategoriaById').resolves(null);

            await CategoriaController.getCategoria(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
        });

        it('Actualizar Categoría: Debe actualizar correctamente', async () => {
            req.params.id = 1;
            req.body = { nombre: 'Tarjetas Gráficas' };

            const catUpd = { id: 1, nombre: 'Tarjetas Gráficas', tipo: 'producto' };
            sinon.stub(CategoriaService, 'updateCategoria').resolves(catUpd);

            await CategoriaController.updateCategoria(req, res);

            expect(jsonSpy.args[0][0]).to.include({ message: "Categoría actualizada correctamente" });
        });

        it('Eliminar Categoría: Debe eliminar si no tiene productos asociados', async () => {
            req.params.id = 1;
            sinon.stub(CategoriaService, 'deleteCategoria').resolves({ message: 'Categoría eliminada correctamente' });

            await CategoriaController.deleteCategoria(req, res);

            expect(jsonSpy.args[0][0]).to.include({ message: "Categoría eliminada correctamente" });
        });

        it('Eliminar Categoría: Debe rechazar si tiene productos asociados (400)', async () => {
            req.params.id = 1;
            sinon.stub(CategoriaService, 'deleteCategoria').rejects(new Error('No se puede eliminar'));

            await CategoriaController.deleteCategoria(req, res);

            expect(statusStub.calledWith(400)).to.be.true;
        });
    });

    describe('Validaciones', () => {
        it('No debe permitir crear categoría sin nombre', async () => {
            req.body = { tipo: 'producto' }; // Falta nombre

            await CategoriaController.createCategoria(req, res);

            expect(statusStub.calledWith(400)).to.be.true;
        });
    });
});
