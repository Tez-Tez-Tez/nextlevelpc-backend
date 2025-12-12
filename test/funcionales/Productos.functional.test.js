const { expect } = require('chai');
const sinon = require('sinon');
const ProductosController = require('../../controllers/ProductosController');
const ProductosService = require('../../services/ProductosService');

describe('Pruebas Funcionales: ProductosController', () => {
    let req, res, statusStub, jsonSpy;

    // Configuración antes de cada prueba
    beforeEach(() => {
        req = {
            body: {},
            params: {},
            query: {}
        };

        statusStub = sinon.stub();
        jsonSpy = sinon.spy();
        
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
     * Prueba: Crear Producto
     */
    describe('crearProducto', () => {
        it('Debe crear un producto exitosamente y retornar 201', async () => {
            req.body = {
                nombre: 'Nvidia RTX 4090',
                categoria_id: 1,
                precio_actual: 1500,
                stock: 10
            };
            const mockProducto = { id: 1, ...req.body };

            sinon.stub(ProductosService, 'crearProducto').resolves(mockProducto);

            await ProductosController.crearProducto(req, res);

            expect(statusStub.calledWith(201)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match({
                success: true,
                message: 'Producto creado exitosamente',
                data: mockProducto
            }))).to.be.true;
        });

        it('Debe retornar 400 si el servicio lanza error de validación', async () => {
            req.body = { precio_actual: 100 }; // Falta nombre
            sinon.stub(ProductosService, 'crearProducto').rejects(new Error('Errores de validación: nombre es requerido'));

            await ProductosController.crearProducto(req, res);

            expect(statusStub.calledWith(400)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match({ success: false }))).to.be.true;
        });
    });

    /**
     * Prueba: Obtener Todos los Productos
     */
    describe('obtenerTodosLosProductos', () => {
        it('Debe retornar la lista de productos y status 200', async () => {
            const mockProductos = [{ id: 1, nombre: 'A' }, { id: 2, nombre: 'B' }];
            sinon.stub(ProductosService, 'obtenerTodosLosProductos').resolves(mockProductos);

            await ProductosController.obtenerTodosLosProductos(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match({
                success: true,
                data: mockProductos
            }))).to.be.true;
        });

        it('Debe retornar 500 si hay error interno', async () => {
            sinon.stub(ProductosService, 'obtenerTodosLosProductos').rejects(new Error('Fallo DB'));

            await ProductosController.obtenerTodosLosProductos(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
        });
    });

    /**
     * Prueba: Obtener Productos Activos
     */
    describe('obtenerProductosActivos', () => {
        it('Debe retornar solo productos activos', async () => {
            const mockActivos = [{ id: 1, estado: 1 }];
            sinon.stub(ProductosService, 'obtenerProductosActivos').resolves(mockActivos);

            await ProductosController.obtenerProductosActivos(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match({ data: mockActivos }))).to.be.true;
        });
    });

    /**
     * Prueba: Buscar Productos (Búsqueda simple)
     */
    describe('buscarProductos', () => {
        it('Debe retornar resultados de búsqueda', async () => {
            req.query.q = 'RTX';
            const mockResult = [{ id: 1, nombre: 'RTX 3060' }];

            sinon.stub(ProductosService, 'buscarProductos').resolves(mockResult);

            await ProductosController.buscarProductos(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match({ data: mockResult }))).to.be.true;
        });

        it('Debe retornar 400 si falta el término de búsqueda', async () => {
            // El servicio lanza error si query está vacío
            sinon.stub(ProductosService, 'buscarProductos').rejects(new Error('El termino de busqueda es requerido'));

            await ProductosController.buscarProductos(req, res);

            expect(statusStub.calledWith(400)).to.be.true;
        });

        it('Debe retornar 500 para otros errores', async () => {
            req.query.q = 'test';
            sinon.stub(ProductosService, 'buscarProductos').rejects(new Error('Error DB'));

            await ProductosController.buscarProductos(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
        });
    });

    /**
     * Prueba: Obtener Producto por ID
     */
    describe('obtenerProductoPorId', () => {
        it('Debe retornar el producto si existe', async () => {
            req.params.id = 1;
            const mockProducto = { id: 1, nombre: 'CPU' };
            sinon.stub(ProductosService, 'obtenerProductoPorId').resolves(mockProducto);

            await ProductosController.obtenerProductoPorId(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match({ data: mockProducto }))).to.be.true;
        });

        it('Debe retornar 500 si no existe (Según implementación actual del controlador)', async () => {
            req.params.id = 999;
            // NOTA: Tu controlador captura el error y devuelve 500, incluso si es "No encontrado"
            sinon.stub(ProductosService, 'obtenerProductoPorId').rejects(new Error('Producto no encontrado'));

            await ProductosController.obtenerProductoPorId(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match({ message: 'Producto no encontrado' }))).to.be.true;
        });
    });

    /**
     * Prueba: Obtener Productos por Categoría
     */
    describe('obtenerProductosPorCategoria', () => {
        it('Debe retornar productos de la categoría', async () => {
            req.params.categoria_id = 5;
            const mockList = [{ id: 1, categoria_id: 5 }];
            sinon.stub(ProductosService, 'obtenerProductosPorCategoria').resolves(mockList);

            await ProductosController.obtenerProductosPorCategoria(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match({ data: mockList }))).to.be.true;
        });

        it('Debe retornar 400 si hay error (ej. ID inválido)', async () => {
            sinon.stub(ProductosService, 'obtenerProductosPorCategoria').rejects(new Error('ID inválido'));
            
            await ProductosController.obtenerProductosPorCategoria(req, res);
            
            expect(statusStub.calledWith(400)).to.be.true;
        });
    });

    /**
     * Prueba: Actualizar Producto
     */
    describe('actualizarProducto', () => {
        it('Debe actualizar y retornar el producto modificado', async () => {
            req.params.id = 1;
            req.body = { precio_actual: 2000 };
            const prodActualizado = { id: 1, precio_actual: 2000 };

            sinon.stub(ProductosService, 'actualizarProducto').resolves(prodActualizado);

            await ProductosController.actualizarProducto(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match({
                success: true,
                message: 'Producto actualizado exitosamente'
            }))).to.be.true;
        });

        it('Debe retornar 400 si falla la actualización', async () => {
            sinon.stub(ProductosService, 'actualizarProducto').rejects(new Error('Error validación'));

            await ProductosController.actualizarProducto(req, res);

            expect(statusStub.calledWith(400)).to.be.true;
        });
    });

    /**
     * Prueba: Eliminar Producto
     */
    describe('eliminarProducto', () => {
        it('Debe eliminar correctamente', async () => {
            req.params.id = 1;
            sinon.stub(ProductosService, 'eliminarProducto').resolves({ mensaje: 'Eliminado' });

            await ProductosController.eliminarProducto(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match({ message: 'Eliminado' }))).to.be.true;
        });

        it('Debe retornar 500 si falla (ej. No encontrado)', async () => {
            req.params.id = 999;
            sinon.stub(ProductosService, 'eliminarProducto').rejects(new Error('Producto no encontrado'));

            await ProductosController.eliminarProducto(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
        });
    });

    /**
     * Prueba: Productos con Imágenes y Filtros (Búsqueda Avanzada)
     */
    describe('obtenerProductosConImagenes', () => {
        it('Debe procesar query params y retornar lista', async () => {
            req.query.busqueda = 'Gamer';
            req.query.categoria_id = '2';

            const mockList = [{ id: 1, nombre: 'PC Gamer' }];
            const serviceStub = sinon.stub(ProductosService, 'obtenerProductosConImagenes').resolves(mockList);

            await ProductosController.obtenerProductosConImagenes(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            // Verificar que se pasaron los argumentos correctos al servicio
            expect(serviceStub.calledWith('Gamer', 2)).to.be.true;
            expect(jsonSpy.calledWith(sinon.match({ data: mockList }))).to.be.true;
        });

        it('Debe manejar errores con status 500', async () => {
            sinon.stub(ProductosService, 'obtenerProductosConImagenes').rejects(new Error('Error filtro'));

            await ProductosController.obtenerProductosConImagenes(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
        });
    });

    /**
     * Prueba: Productos Destacados
     */
    describe('obtenerProductosDestacados', () => {
        it('Debe usar el límite por defecto si no se envía', async () => {
            const mockDestacados = [{ id: 1, stock: 100 }];
            const serviceStub = sinon.stub(ProductosService, 'obtenerProductosDestacados').resolves(mockDestacados);

            await ProductosController.obtenerProductosDestacados(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(serviceStub.calledWith(6)).to.be.true; // Límite por defecto en controlador
        });

        it('Debe usar el límite enviado en query', async () => {
            req.query.limite = '3';
            const serviceStub = sinon.stub(ProductosService, 'obtenerProductosDestacados').resolves([]);

            await ProductosController.obtenerProductosDestacados(req, res);

            expect(serviceStub.calledWith(3)).to.be.true;
        });
    });
});