const { expect } = require('chai');
const sinon = require('sinon');

const CategoriaService = require('../../services/CategoriaService');
const Categoria = require('../../models/Categoria');
const Productos = require('../../models/Productos');
const Servicio = require('../../models/Servicio');

describe('Pruebas Unitarias: CategoriaService', () => {

    afterEach(() => {
        sinon.restore();
    });

    describe('getAllCategorias', () => {
        it('Debe retornar la lista de categorías', async () => {
            const lista = [{ id: 1, nombre: 'Componentes' }];
            sinon.stub(Categoria, 'findAll').resolves(lista);

            const resultado = await CategoriaService.getAllCategorias();
            expect(resultado).to.deep.equal(lista);
        });

        it('Debe lanzar error si falla el modelo', async () => {
            sinon.stub(Categoria, 'findAll').rejects(new Error('Error DB'));
            try {
                await CategoriaService.getAllCategorias();
            } catch (error) {
                expect(error.message).to.include('Error al obtener categorías');
            }
        });
    });

    describe('getCategoriaById', () => {
        it('Debe retornar la categoría si existe', async () => {
            const cat = { id: 1, nombre: 'Test' };
            sinon.stub(Categoria, 'findById').resolves(cat);

            const resultado = await CategoriaService.getCategoriaById(1);
            expect(resultado).to.deep.equal(cat);
        });

        it('Debe lanzar error si no existe', async () => {
            sinon.stub(Categoria, 'findById').resolves(null);
            try {
                await CategoriaService.getCategoriaById(999);
            } catch (error) {
                expect(error.message).to.include('Categoría no encontrada');
            }
        });
    });

    describe('createCategoria', () => {
        it('Debe crear una categoría si no existe', async () => {
            const input = { nombre: 'Nueva', tipo: 'producto' };
            const output = { id: 10, ...input };

            sinon.stub(Categoria, 'exists').resolves(false);
            sinon.stub(Categoria, 'create').resolves(output);

            const resultado = await CategoriaService.createCategoria(input);
            expect(resultado).to.deep.equal(output);
        });

        it('Debe lanzar error si ya existe', async () => {
            const input = { nombre: 'Duplicada', tipo: 'producto' };
            sinon.stub(Categoria, 'exists').resolves(true);

            try {
                await CategoriaService.createCategoria(input);
            } catch (error) {
                expect(error.message).to.include('Ya existe una categoría');
            }
        });
    });

    describe('updateCategoria', () => {
        it('Debe actualizar si existe y el nombre es único', async () => {
            const id = 1;
            const input = { nombre: 'Editado', tipo: 'producto' };
            const catExistente = { id: 1, nombre: 'Viejo', tipo: 'producto' };

            sinon.stub(Categoria, 'findById').resolves(catExistente);
            sinon.stub(Categoria, 'exists').resolves(false); 
            sinon.stub(Categoria, 'update').resolves({ id, ...input });

            const resultado = await CategoriaService.updateCategoria(id, input);
            expect(resultado.nombre).to.equal('Editado');
        });

        it('Debe lanzar error si no se envían campos', async () => {
            sinon.stub(Categoria, 'findById').resolves({ id: 1, nombre: 'Viejo', tipo: 'producto' });
            
            try {
                await CategoriaService.updateCategoria(1, {});
            } catch (error) {
                expect(error.message).to.include('No se enviaron campos');
            }
        });
    });

    describe('deleteCategoria', () => {
        it('Debe eliminar si no tiene productos ni servicios asociados', async () => {
            const id = 1;
            sinon.stub(Categoria, 'findById').resolves({ id });
            
            sinon.stub(Productos, 'contarPorCategoria').resolves(0);
            sinon.stub(Servicio, 'contarPorCategoria').resolves(0);
            
            sinon.stub(Categoria, 'delete').resolves(true);

            const resultado = await CategoriaService.deleteCategoria(id);
            expect(resultado).to.have.property('message', 'Categoría eliminada correctamente');
        });

        it('Debe lanzar error si tiene productos asociados', async () => {
            const id = 1;
            sinon.stub(Categoria, 'findById').resolves({ id });
            
            sinon.stub(Productos, 'contarPorCategoria').resolves(5);
            sinon.stub(Servicio, 'contarPorCategoria').resolves(0);

            try {
                await CategoriaService.deleteCategoria(id);
            } catch (error) {
                expect(error.message).to.include('tiene productos o servicios asociados');
            }
        });
    });
});