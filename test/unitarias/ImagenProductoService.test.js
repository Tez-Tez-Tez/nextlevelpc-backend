const { expect } = require('chai');
const sinon = require('sinon');

const ImagenProductoService = require('../../services/ImagenProductoService');
const ImagenProducto = require('../../models/ImagenProducto');

describe('Pruebas Unitarias: ImagenProductoService', () => {

    afterEach(() => {
        sinon.restore();
    });

    describe('crearImagen', () => {
        it('Debe crear una imagen si tiene los datos requeridos', async () => {
            const datos = { producto_id: 1, url: 'http://img.com/1.jpg' };
            
            // Stub del modelo: retorna el ID de la imagen creada
            sinon.stub(ImagenProducto, 'crear').resolves(10);

            const resultado = await ImagenProductoService.crearImagen(datos);
            expect(resultado).to.equal(10);
        });

        it('Debe lanzar error si faltan datos (producto_id o url)', async () => {
            const datosIncompletos = { producto_id: 1 }; // Falta URL

            try {
                await ImagenProductoService.crearImagen(datosIncompletos);
            } catch (error) {
                expect(error.message).to.include('Producto ID y URL son requeridos');
            }
        });
    });

    describe('obtenerImagenesPorProducto', () => {
        it('Debe retornar lista de imágenes', async () => {
            const imagenesFake = [{ id: 1, url: 'img1.jpg' }, { id: 2, url: 'img2.jpg' }];
            sinon.stub(ImagenProducto, 'obtenerPorProducto').resolves(imagenesFake);

            const resultado = await ImagenProductoService.obtenerImagenesPorProducto(1);
            expect(resultado).to.deep.equal(imagenesFake);
        });

        it('Debe lanzar error si no se envía ID de producto', async () => {
            try {
                await ImagenProductoService.obtenerImagenesPorProducto(null);
            } catch (error) {
                expect(error.message).to.include('Producto ID es requerido');
            }
        });
    });

    describe('obtenerImagenPrincipal', () => {
        it('Debe retornar la imagen principal', async () => {
            const imagenPrincipal = { id: 5, url: 'main.jpg', es_principal: 1 };
            sinon.stub(ImagenProducto, 'obtenerPrincipal').resolves(imagenPrincipal);

            const resultado = await ImagenProductoService.obtenerImagenPrincipal(1);
            expect(resultado).to.deep.equal(imagenPrincipal);
        });
    });

    describe('eliminarImagen', () => {
        it('Debe eliminar la imagen correctamente', async () => {
            // Simulamos que el modelo retorna true (eliminado)
            sinon.stub(ImagenProducto, 'eliminar').resolves(true);

            const resultado = await ImagenProductoService.eliminarImagen(5);
            expect(resultado).to.have.property('mensaje', 'Imagen eliminada correctamente');
        });

        it('Debe lanzar error "Imagen no encontrada" si el modelo retorna false', async () => {
            // Simulamos que no se encontró o no se eliminó
            sinon.stub(ImagenProducto, 'eliminar').resolves(false);

            try {
                await ImagenProductoService.eliminarImagen(999);
            } catch (error) {
                expect(error.message).to.include('Imagen no encontrada');
            }
        });
    });

    describe('establecerImagenPrincipal', () => {
        it('Debe establecer la imagen como principal', async () => {
            sinon.stub(ImagenProducto, 'establecerPrincipal').resolves(true);

            const resultado = await ImagenProductoService.establecerImagenPrincipal(1, 10);
            expect(resultado).to.have.property('mensaje', 'Imagen principal establecida correctamente');
        });

        it('Debe lanzar error si faltan IDs', async () => {
            try {
                await ImagenProductoService.establecerImagenPrincipal(null, 10);
            } catch (error) {
                expect(error.message).to.include('Producto ID e Imagen ID son requeridos');
            }
        });
    });
});