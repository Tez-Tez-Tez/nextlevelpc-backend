const { expect } = require('chai');
const sinon = require('sinon');
const ImagenProductoController = require('../../controllers/ImagenProductoController');
const ImagenProductoService = require('../../services/ImagenProductoService');

describe('Pruebas Funcionales: ImagenProductoController', () => {
    let req, res, statusStub, jsonSpy;

    // Configuración antes de cada prueba
    beforeEach(() => {
        // Simulamos el objeto request (req)
        req = {
            body: {},
            params: {}
        };

        // Simulamos el objeto response (res)
        statusStub = sinon.stub();
        jsonSpy = sinon.spy();
        
        res = {
            status: statusStub,
            json: jsonSpy
        };

        // Hacemos que res.status devuelva res para permitir encadenamiento (res.status().json())
        statusStub.returns({ json: jsonSpy });
    });

    // Restaurar los stubs después de cada prueba para no afectar otras
    afterEach(() => {
        sinon.restore();
    });

    /**
     * Prueba: Crear Imagen
     */
    describe('crear', () => {
        it('Debe retornar status 201 y el ID cuando se crea la imagen exitosamente', async () => {
            req.body = { producto_id: 1, url: 'http://img.com/foto.jpg' };
            const fakeId = 100;

            // Simulamos que el servicio responde correctamente
            sinon.stub(ImagenProductoService, 'crearImagen').resolves(fakeId);

            await ImagenProductoController.crear(req, res);

            expect(statusStub.calledWith(201)).to.be.true;
            expect(jsonSpy.calledWith({
                mensaje: 'Imagen creada exitosamente',
                imagen_id: fakeId
            })).to.be.true;
        });

        it('Debe retornar status 500 si el servicio falla', async () => {
            req.body = { producto_id: 1 };
            const errorMsg = 'Error simulado';

            // Simulamos error en el servicio
            sinon.stub(ImagenProductoService, 'crearImagen').rejects(new Error(errorMsg));

            await ImagenProductoController.crear(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match.has('mensaje'))).to.be.true;
        });
    });

    /**
     * Prueba: Obtener por Producto
     */
    describe('obtenerPorProducto', () => {
        it('Debe retornar status 200 y la lista de imágenes', async () => {
            req.params.producto_id = 5;
            const mockImagenes = [
                { id: 1, url: 'url1', es_principal: 1 },
                { id: 2, url: 'url2', es_principal: 0 }
            ];

            sinon.stub(ImagenProductoService, 'obtenerImagenesPorProducto').resolves(mockImagenes);

            await ImagenProductoController.obtenerPorProducto(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.calledWith(mockImagenes)).to.be.true;
        });
    });

    /**
     * Prueba: Obtener Imagen Principal
     */
    describe('obtenerPrincipal', () => {
        it('Debe retornar status 200 y la imagen si existe', async () => {
            req.params.producto_id = 5;
            const mockImagen = { id: 1, url: 'url1', es_principal: 1 };

            sinon.stub(ImagenProductoService, 'obtenerImagenPrincipal').resolves(mockImagen);

            await ImagenProductoController.obtenerPrincipal(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.calledWith(mockImagen)).to.be.true;
        });

        it('Debe retornar status 404 si no hay imagen principal', async () => {
            req.params.producto_id = 5;

            // Servicio retorna null (no encontrado)
            sinon.stub(ImagenProductoService, 'obtenerImagenPrincipal').resolves(null);

            await ImagenProductoController.obtenerPrincipal(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
            expect(jsonSpy.calledWith({ mensaje: 'No se encontró imagen principal para este producto' })).to.be.true;
        });
    });

    /**
     * Prueba: Eliminar Imagen
     */
    describe('eliminar', () => {
        it('Debe retornar status 200 si se elimina correctamente', async () => {
            req.params.id = 10;
            
            sinon.stub(ImagenProductoService, 'eliminarImagen').resolves({ mensaje: 'Imagen eliminada correctamente' });

            await ImagenProductoController.eliminar(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.calledWith({ mensaje: 'Imagen eliminada correctamente' })).to.be.true;
        });

        it('Debe retornar status 404 si la imagen no existe (Error específico)', async () => {
            req.params.id = 999;

            // Simulamos el error específico que lanza tu servicio
            sinon.stub(ImagenProductoService, 'eliminarImagen').rejects(new Error('Imagen no encontrada'));

            await ImagenProductoController.eliminar(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
            expect(jsonSpy.calledWith({ mensaje: 'Imagen no encontrada' })).to.be.true;
        });

        it('Debe retornar status 500 para otros errores', async () => {
            req.params.id = 10;
            sinon.stub(ImagenProductoService, 'eliminarImagen').rejects(new Error('Fallo base de datos'));

            await ImagenProductoController.eliminar(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
        });
    });

    /**
     * Prueba: Establecer Imagen Principal
     */
    describe('establecerPrincipal', () => {
        it('Debe retornar status 200 al actualizar correctamente', async () => {
            req.body = { producto_id: 1, imagen_id: 2 };

            sinon.stub(ImagenProductoService, 'establecerImagenPrincipal')
                .resolves({ mensaje: 'Imagen principal establecida correctamente' });

            await ImagenProductoController.establecerPrincipal(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.calledWith({ mensaje: 'Imagen principal establecida correctamente' })).to.be.true;
        });

        it('Debe retornar status 500 si faltan datos o falla el servicio', async () => {
            req.body = { producto_id: 1 }; // Falta imagen_id

            sinon.stub(ImagenProductoService, 'establecerImagenPrincipal')
                .rejects(new Error('Producto ID e Imagen ID son requeridos'));

            await ImagenProductoController.establecerPrincipal(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match.has('mensaje'))).to.be.true;
        });
    });
});