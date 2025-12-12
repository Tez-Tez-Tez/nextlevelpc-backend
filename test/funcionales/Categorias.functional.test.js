const { expect } = require('chai');
const sinon = require('sinon');

const CategoriaController = require('../../controllers/CategoriaController');
const CategoriaService = require('../../services/CategoriaService');

describe('Pruebas Funcionales: Categorias', () => {
    let req, res, statusStub, jsonSpy;

    // Configuración antes de cada prueba
    beforeEach(() => {
        statusStub = sinon.stub();
        jsonSpy = sinon.spy();

        req = {
            body: {},
            params: {},
            query: {}
        };

        res = {
            status: statusStub,
            json: jsonSpy
        };

        // Permitir encadenamiento res.status().json()
        statusStub.returns({ json: jsonSpy });
    });

    // Restaurar los stubs después de cada prueba
    afterEach(() => {
        sinon.restore();
    });

    /**
     * Prueba: Listar Categorías
     */
    describe('getCategorias', () => {
        it('Debe retornar todas las categorías', async () => {
            const mockCats = [
                { id: 1, nombre: 'Hardware', tipo: 'producto' },
                { id: 2, nombre: 'Soporte', tipo: 'servicio' }
            ];
            sinon.stub(CategoriaService, 'getAllCategorias').resolves(mockCats);

            await CategoriaController.getCategorias(req, res);

            // El controlador usa res.json() directamente (status 200 por defecto)
            expect(jsonSpy.calledWith(mockCats)).to.be.true;
        });

        it('Debe retornar 500 si el servicio falla', async () => {
            sinon.stub(CategoriaService, 'getAllCategorias').rejects(new Error('Error DB'));

            await CategoriaController.getCategorias(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
        });
    });

    /**
     * Prueba: Listar solo Categorías de Productos
     */
    describe('getCategoriasProductos', () => {
        it('Debe retornar solo categorías de tipo producto', async () => {
            const mockCats = [{ id: 1, nombre: 'GPU', tipo: 'producto' }];
            sinon.stub(CategoriaService, 'getCategoriasProductos').resolves(mockCats);

            await CategoriaController.getCategoriasProductos(req, res);

            expect(jsonSpy.calledWith(mockCats)).to.be.true;
        });
    });

    /**
     * Prueba: Obtener Categoría por ID
     */
    describe('getCategoria', () => {
        it('Debe retornar la categoría si existe', async () => {
            req.params.id = 1;
            const mockCat = { id: 1, nombre: 'GPU' };

            sinon.stub(CategoriaService, 'getCategoriaById').resolves(mockCat);

            await CategoriaController.getCategoria(req, res);

            expect(jsonSpy.calledWith(mockCat)).to.be.true;
        });

        it('Debe retornar 404 si la categoría devuelve null (no encontrada)', async () => {
            req.params.id = 999;
            sinon.stub(CategoriaService, 'getCategoriaById').resolves(null);

            await CategoriaController.getCategoria(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match({ error: 'Categoría no encontrada' }))).to.be.true;
        });

        it('Debe retornar 500 si hay un error en el servicio', async () => {
            req.params.id = 1;
            sinon.stub(CategoriaService, 'getCategoriaById').rejects(new Error('Fallo interno'));

            await CategoriaController.getCategoria(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
        });
    });

    /**
     * Prueba: Crear Categoría
     */
    describe('createCategoria', () => {
        it('Debe crear una categoría y retornar 201', async () => {
            req.body = { nombre: 'Periféricos', tipo: 'producto' };
            const mockCreated = { id: 10, ...req.body };

            sinon.stub(CategoriaService, 'createCategoria').resolves(mockCreated);

            await CategoriaController.createCategoria(req, res);

            expect(statusStub.calledWith(201)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match({
                message: "Categoría creada correctamente",
                id: 10
            }))).to.be.true;
        });

        it('Debe retornar 400 si hay error de validación o duplicado', async () => {
            req.body = { tipo: 'producto' }; // Falta nombre
            
            sinon.stub(CategoriaService, 'createCategoria').rejects(new Error('Ya existe una categoría'));

            await CategoriaController.createCategoria(req, res);

            expect(statusStub.calledWith(400)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match({ error: 'Ya existe una categoría' }))).to.be.true;
        });
    });

    /**
     * Prueba: Actualizar Categoría
     */
    describe('updateCategoria', () => {
        it('Debe actualizar y retornar los datos nuevos', async () => {
            req.params.id = 1;
            req.body = { nombre: 'Nuevo Nombre' };
            const mockUpdated = { id: 1, nombre: 'Nuevo Nombre', tipo: 'producto' };

            sinon.stub(CategoriaService, 'updateCategoria').resolves(mockUpdated);

            await CategoriaController.updateCategoria(req, res);

            // El controlador usa res.json() (200 implícito)
            expect(jsonSpy.calledWith(sinon.match({
                message: "Categoría actualizada correctamente",
                nombre: 'Nuevo Nombre'
            }))).to.be.true;
        });

        it('Debe retornar 400 si falla la actualización', async () => {
            req.params.id = 1;
            sinon.stub(CategoriaService, 'updateCategoria').rejects(new Error('Error update'));

            await CategoriaController.updateCategoria(req, res);

            expect(statusStub.calledWith(400)).to.be.true;
        });
    });

    /**
     * Prueba: Eliminar Categoría
     */
    describe('deleteCategoria', () => {
        it('Debe eliminar correctamente', async () => {
            req.params.id = 1;
            sinon.stub(CategoriaService, 'deleteCategoria').resolves({ message: 'OK' });

            await CategoriaController.deleteCategoria(req, res);

            expect(jsonSpy.calledWith(sinon.match({
                message: "Categoría eliminada correctamente",
                id: 1
            }))).to.be.true;
        });

        it('Debe retornar 400 si no se puede eliminar (ej. tiene productos)', async () => {
            req.params.id = 1;
            sinon.stub(CategoriaService, 'deleteCategoria').rejects(new Error('Tiene productos asociados'));

            await CategoriaController.deleteCategoria(req, res);

            expect(statusStub.calledWith(400)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match({ error: 'Tiene productos asociados' }))).to.be.true;
        });
    });
});