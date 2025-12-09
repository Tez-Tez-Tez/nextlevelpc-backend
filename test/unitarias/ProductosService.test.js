const { expect } = require('chai');
const sinon = require('sinon');
const ProductosService = require('../../services/ProductosService');
const Productos = require('../../models/Productos');

describe('Pruebas Unitarias: ProductosService', () => {
    
    // Restaurar los stubs después de cada test para no afectar otros
    afterEach(() => {
        sinon.restore();
    });

    describe('obtenerTodosLosProductos', () => {
        it('Debe retornar una lista de productos cuando el modelo responde correctamente', async () => {
            // 1. Preparar datos falsos
            const productosFalsos = [
                { id: 1, nombre: 'PC Gamer', precio: 1000 },
                { id: 2, nombre: 'Mouse', precio: 20 }
            ];

            // Cuando alguien llame a Productos.obtenerTodos, devuelve productosFalsos
            const stub = sinon.stub(Productos, 'obtenerTodos').resolves(productosFalsos);

            //Ejecutar la función del servicio
            const resultado = await ProductosService.obtenerTodosLosProductos();

            //Aserciones (Verificaciones)
            expect(stub.calledOnce).to.be.true; // Se llamó al modelo?
            expect(resultado).to.be.an('array'); // Es un array?
            expect(resultado).to.have.lengthOf(2); // Tiene 2 elementos?
            expect(resultado[0].nombre).to.equal('PC Gamer'); // El dato es correcto?
        });

        it('Debe lanzar un error si el modelo falla', async () => {
            // Simulamos un error de base de datos
            sinon.stub(Productos, 'obtenerTodos').rejects(new Error('Error de conexión'));

            try {
                await ProductosService.obtenerTodosLosProductos();
            } catch (error) {
                expect(error.message).to.include('Error al obtener productos');
            }
        });
    });

    describe('buscarProductos', () => {
        it('Debe lanzar error si el query está vacío', async () => {
            try {
                await ProductosService.buscarProductos('');
            } catch (error) {
                expect(error.message).to.equal("El termino de busqueda es requerido");
            }
        });

        it('Debe retornar productos encontrados', async () => {
            const busqueda = 'Gamer';
            const resultadoSimulado = [{ id: 1, nombre: 'Silla Gamer' }];
            
            sinon.stub(Productos, 'buscarPorNombre').resolves(resultadoSimulado);

            const resultado = await ProductosService.buscarProductos(busqueda);
            
            expect(resultado).to.deep.equal(resultadoSimulado);
        });
    });

    describe('eliminarProducto', () => {
        it('Debe eliminar el producto si existe', async () => {
            // Simulamos que el producto SI existe
            sinon.stub(Productos, 'obtenerPorId').resolves({ id: 5, nombre: 'Teclado' });
            // Simulamos que el borrado es exitoso
            sinon.stub(Productos, 'eliminar').resolves(true);

            const respuesta = await ProductosService.eliminarProducto(5);

            expect(respuesta).to.have.property('mensaje', 'Producto eliminado correctamente');
        });

        it('Debe lanzar error si el producto no existe', async () => {
            // Simulamos que el producto NO existe (retorna null)
            sinon.stub(Productos, 'obtenerPorId').resolves(null);

            try {
                await ProductosService.eliminarProducto(999);
            } catch (error) {
                expect(error.message).to.include('Producto no encontrado');
            }
        });
    });
});