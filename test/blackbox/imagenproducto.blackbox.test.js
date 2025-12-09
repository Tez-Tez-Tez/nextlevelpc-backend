const { expect } = require('chai');
const sinon = require('sinon');
const ImagenProductoController = require('../../controllers/ImagenProductoController');
const ImagenProductoService = require('../../services/ImagenProductoService');

describe('Pruebas Caja Negra: ImagenProductoController', () => {
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

    describe('POST /api/imagenes - crear', () => {
        it('Debe responder 201 cuando se crea exitosamente', async () => {
            req.body = {
                producto_id: 1,
                url_imagen: 'https://example.com/imagen.jpg',
                es_principal: true
            };

            sinon.stub(ImagenProductoService, 'crearImagen').resolves(10);

            await ImagenProductoController.crear(req, res);

            expect(statusStub.calledWith(201)).to.be.true;
            expect(jsonSpy.args[0][0]).to.have.property('mensaje', 'Imagen creada exitosamente');
        });

        it('Debe responder 500 cuando hay error', async () => {
            req.body = {};

            sinon.stub(ImagenProductoService, 'crearImagen').rejects(new Error('Datos inválidos'));

            await ImagenProductoController.crear(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
        });
    });

    describe('GET /api/imagenes/producto/:producto_id - obtenerPorProducto', () => {
        it('Debe responder 200 con lista de imágenes', async () => {
            req.params.producto_id = '1';

            const mockImagenes = [
                { id: 1, producto_id: 1, url_imagen: 'img1.jpg', es_principal: true },
                { id: 2, producto_id: 1, url_imagen: 'img2.jpg', es_principal: false }
            ];

            sinon.stub(ImagenProductoService, 'obtenerImagenesPorProducto').resolves(mockImagenes);

            await ImagenProductoController.obtenerPorProducto(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.args[0][0]).to.be.an('array');
        });
    });

    describe('GET /api/imagenes/principal/:producto_id - obtenerPrincipal', () => {
        it('Debe responder 200 cuando existe imagen principal', async () => {
            req.params.producto_id = '1';

            const mockImagen = { id: 1, producto_id: 1, url_imagen: 'img1.jpg', es_principal: true };
            sinon.stub(ImagenProductoService, 'obtenerImagenPrincipal').resolves(mockImagen);

            await ImagenProductoController.obtenerPrincipal(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
        });

        it('Debe responder 404 cuando no existe imagen principal', async () => {
            req.params.producto_id = '999';

            sinon.stub(ImagenProductoService, 'obtenerImagenPrincipal').resolves(null);

            await ImagenProductoController.obtenerPrincipal(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
        });
    });

    describe('DELETE /api/imagenes/:id - eliminar', () => {
        it('Debe responder 200 cuando elimina exitosamente', async () => {
            req.params.id = '1';

            sinon.stub(ImagenProductoService, 'eliminarImagen').resolves({ mensaje: 'Imagen eliminada' });

            await ImagenProductoController.eliminar(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
        });

        it('Debe responder 404 cuando la imagen no existe', async () => {
            req.params.id = '999';

            sinon.stub(ImagenProductoService, 'eliminarImagen').rejects(new Error('Imagen no encontrada'));

            await ImagenProductoController.eliminar(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
        });
    });

    describe('PATCH /api/imagenes/principal - establecerPrincipal', () => {
        it('Debe responder 200 cuando establece imagen principal', async () => {
            req.body = { producto_id: 1, imagen_id: 2 };

            sinon.stub(ImagenProductoService, 'establecerImagenPrincipal').resolves({ mensaje: 'Imagen principal establecida' });

            await ImagenProductoController.establecerPrincipal(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
        });
    });
});
