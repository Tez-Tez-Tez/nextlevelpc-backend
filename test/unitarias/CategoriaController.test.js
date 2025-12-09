const { expect } = require('chai');
const sinon = require('sinon');

const CategoriaController = require('../../controllers/CategoriaController');
const CategoriaService = require('../../services/CategoriaService');

describe('Pruebas Unitarias: CategoriaController', () => {
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

    describe('getCategorias', () => {
        it('Debe responder 200 con la lista (usando res.json)', async () => {
            const lista = [{ id: 1, nombre: 'A' }];
            sinon.stub(CategoriaService, 'getAllCategorias').resolves(lista);

            await CategoriaController.getCategorias(req, res);

            // Tu controlador usa res.json(categorias), que implícitamente es 200
            expect(jsonSpy.calledWith(lista)).to.be.true;
        });

        it('Debe responder 500 si falla', async () => {
            sinon.stub(CategoriaService, 'getAllCategorias').rejects(new Error('Fallo'));
            await CategoriaController.getCategorias(req, res);
            expect(statusStub.calledWith(500)).to.be.true;
        });
    });

    describe('getCategoria', () => {
        it('Debe responder con la categoría si existe', async () => {
            req.params.id = 1;
            const cat = { id: 1 };
            sinon.stub(CategoriaService, 'getCategoriaById').resolves(cat);

            await CategoriaController.getCategoria(req, res);
            expect(jsonSpy.calledWith(cat)).to.be.true;
        });

        it('Debe responder 404 si no existe (retorna null o lanza error)', async () => {
            req.params.id = 999;
            // Tu controlador maneja: if (!categoria) return 404
            // Pero tu servicio lanza error si no encuentra. 
            // Si el servicio lanza error, el catch del controller lo atrapa.
            // Si el servicio retornara null, entraría al if (!categoria).
            // Probemos simulando que el servicio devuelve null (comportamiento defensivo)
            sinon.stub(CategoriaService, 'getCategoriaById').resolves(null);

            await CategoriaController.getCategoria(req, res);
            expect(statusStub.calledWith(404)).to.be.true;
        });
    });

    describe('createCategoria', () => {
        it('Debe responder 201 al crear', async () => {
            req.body = { nombre: 'Nueva' };
            const catCreada = { id: 1, nombre: 'Nueva', tipo: 'producto' };
            
            sinon.stub(CategoriaService, 'createCategoria').resolves(catCreada);

            await CategoriaController.createCategoria(req, res);

            expect(statusStub.calledWith(201)).to.be.true;
            expect(jsonSpy.args[0][0]).to.include({ message: "Categoría creada correctamente" });
        });

        it('Debe responder 400 si hay error de validación o duplicado', async () => {
            sinon.stub(CategoriaService, 'createCategoria').rejects(new Error('Ya existe'));

            await CategoriaController.createCategoria(req, res);

            expect(statusStub.calledWith(400)).to.be.true;
        });
    });

    describe('updateCategoria', () => {
        it('Debe responder con JSON al actualizar', async () => {
            req.params.id = 1;
            req.body = { nombre: 'Upd' };
            const catUpd = { id: 1, nombre: 'Upd', tipo: 'producto' };

            sinon.stub(CategoriaService, 'updateCategoria').resolves(catUpd);

            await CategoriaController.updateCategoria(req, res);

            // res.json(...)
            expect(jsonSpy.args[0][0]).to.include({ message: "Categoría actualizada correctamente" });
        });
    });

    describe('deleteCategoria', () => {
        it('Debe responder con JSON al eliminar', async () => {
            req.params.id = 1;
            sinon.stub(CategoriaService, 'deleteCategoria').resolves({ message: 'OK' });

            await CategoriaController.deleteCategoria(req, res);

            expect(jsonSpy.args[0][0]).to.include({ message: "Categoría eliminada correctamente" });
        });

        it('Debe responder 400 si falla (ej: tiene productos)', async () => {
            sinon.stub(CategoriaService, 'deleteCategoria').rejects(new Error('No se puede eliminar'));

            await CategoriaController.deleteCategoria(req, res);

            expect(statusStub.calledWith(400)).to.be.true;
        });
    });
});