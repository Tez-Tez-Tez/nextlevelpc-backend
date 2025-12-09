const { expect } = require('chai');
const sinon = require('sinon');

const ImagenProductoController = require('../../controllers/ImagenProductoController');
const ImagenProductoService = require('../../services/ImagenProductoService');

describe('Pruebas Unitarias: ImagenProductoController', () => {
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

    describe('crear', () => {
        it('Debe responder 201 con el ID de la imagen creada', async () => {
            req.body = { producto_id: 1, url: 'test.jpg' };
            
            // Stub del servicio: retorna el ID (ej: 50)
            sinon.stub(ImagenProductoService, 'crearImagen').resolves(50);

            await ImagenProductoController.crear(req, res);

            expect(statusStub.calledWith(201)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match({ 
                mensaje: 'Imagen creada exitosamente', 
                imagen_id: 50 
            }))).to.be.true;
        });

        it('Debe responder 500 si hay error en el servicio', async () => {
            sinon.stub(ImagenProductoService, 'crearImagen').rejects(new Error('Fallo DB'));

            await ImagenProductoController.crear(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
        });
    });

    describe('obtenerPorProducto', () => {
        it('Debe responder 200 con la lista de imágenes', async () => {
            req.params.producto_id = 1;
            const lista = [{ id: 1, url: 'a.jpg' }];
            
            sinon.stub(ImagenProductoService, 'obtenerImagenesPorProducto').resolves(lista);

            await ImagenProductoController.obtenerPorProducto(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.calledWith(lista)).to.be.true;
        });
    });

    describe('obtenerPrincipal', () => {
        it('Debe responder 200 con la imagen principal', async () => {
            req.params.producto_id = 1;
            const img = { id: 1, es_principal: 1 };
            
            sinon.stub(ImagenProductoService, 'obtenerImagenPrincipal').resolves(img);

            await ImagenProductoController.obtenerPrincipal(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.calledWith(img)).to.be.true;
        });

        it('Debe responder 404 si no existe imagen principal', async () => {
            req.params.producto_id = 1;
            // Servicio retorna null
            sinon.stub(ImagenProductoService, 'obtenerImagenPrincipal').resolves(null);

            await ImagenProductoController.obtenerPrincipal(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
            expect(jsonSpy.args[0][0].mensaje).to.include('No se encontró imagen principal');
        });
    });

    describe('eliminar', () => {
        it('Debe responder 200 al eliminar', async () => {
            req.params.id = 10;
            sinon.stub(ImagenProductoService, 'eliminarImagen').resolves({ mensaje: 'OK' });

            await ImagenProductoController.eliminar(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
        });

        it('Debe responder 404 si la imagen no existe', async () => {
            req.params.id = 999;
            // Simulamos el mensaje exacto que busca tu controlador
            sinon.stub(ImagenProductoService, 'eliminarImagen').rejects(new Error('Imagen no encontrada'));

            await ImagenProductoController.eliminar(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
        });

        it('Debe responder 500 para otros errores', async () => {
            req.params.id = 10;
            sinon.stub(ImagenProductoService, 'eliminarImagen').rejects(new Error('Error DB'));

            await ImagenProductoController.eliminar(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
        });
    });

    describe('establecerPrincipal', () => {
        it('Debe responder 200 al establecer principal', async () => {
            req.body = { producto_id: 1, imagen_id: 2 };
            sinon.stub(ImagenProductoService, 'establecerImagenPrincipal').resolves({ mensaje: 'OK' });

            await ImagenProductoController.establecerPrincipal(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
        });
    });
});