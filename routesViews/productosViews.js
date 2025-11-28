const express = require('express');
const router = express.Router();
const ProductosService = require('../services/ProductosService');
const CategoriaService = require('../services/categoriaService');
const ImagenProductoService = require('../services/ImagenProductoService');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/productos');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.get('/', async (req, res) => { 
    try {
        const busqueda = (req.query.busqueda || '').toString().trim();
        
        const categoria_seleccionada = parseInt(req.query.categoria_id) || 0; 
        
        const categorias = await CategoriaService.getCategoriasProductos();
        
        const productos = await ProductosService.obtenerProductosConImagenes(busqueda, categoria_seleccionada);
        
        res.render('productos/index', { 
            productos: Array.isArray(productos) ? productos : [],
            categorias: Array.isArray(categorias) ? categorias : [],
            busqueda: busqueda,
            categoria_seleccionada: categoria_seleccionada 
        });
    } catch (error) {
        console.error("Error cargando productos:", error);
        res.status(500).send("Ocurrió un error al cargar la gestión de productos.");
    }
});

// Formulario crear producto
router.get('/create', async (req, res) => {
    try {
        console.log("Accediendo a formulario crear");
        
        const categorias = await CategoriaService.getCategoriasProductos();
        console.log("Categorías encontradas:", categorias ? categorias.length : 0);
        
        res.render('productos/create', { 
            categorias: Array.isArray(categorias) ? categorias : [] 
        });
    } catch (error) {
        console.error("Error cargando formulario:", error.message);
        res.status(500).send(`
            <h1>Error cargando formulario</h1>
            <p><strong>Error:</strong> ${error.message}</p>
            <a href="/productos" class="btn btn-primary">Volver a productos</a>
        `);
    }
});

router.post('/crear', upload.array('imagenes', 5), async (req, res) => {
    try {
        console.log("Creando producto con imágenes:", req.body);
        
        const { nombre, categoria_id, precio_actual, stock } = req.body;

        const nuevoProducto = await ProductosService.crearProducto({
            nombre,
            categoria_id: parseInt(categoria_id),
            precio_actual: parseFloat(precio_actual),
            stock: stock ? parseInt(stock) : 0
        });

        console.log("Producto creado con ID:", nuevoProducto.id);

        if (req.files && req.files.length > 0) {
            console.log("Procesando", req.files.length, "imágenes");
            for (let i = 0; i < req.files.length; i++) {
                await ImagenProductoService.crearImagen({
                    producto_id: nuevoProducto.id,
                    url: '/uploads/productos/' + req.files[i].filename,
                    es_principal: i === 0 ? 1 : 0
                });
            }
        }

        res.redirect('/productos');
        
    } catch (error) {
        console.error("Error creando producto con imágenes:", error.message);
        res.status(500).send(`
            <h1>Error creando producto</h1>
            <p><strong>Error:</strong> ${error.message}</p>
            <a href="/productos/create" class="btn btn-primary">Volver al formulario</a>
        `);
    }
});

router.get('/edit/:id', async (req, res) => {
    try {
        console.log("Editando producto ID:", req.params.id);
        
        const producto = await ProductosService.obtenerProductoPorId(req.params.id);
        const categorias = await CategoriaService.getCategoriasProductos();

        if (!producto) {
            return res.status(404).send('Producto no encontrado');
        }

        res.render('productos/edit', { 
            producto, 
            categorias: Array.isArray(categorias) ? categorias : [] 
        });
    } catch (error) {
        console.error("Error cargando edición:", error.message);
        res.status(500).send("Error interno: " + error.message);
    }
});

router.post('/edit/:id', async (req, res) => {
    try {
        console.log("Actualizando producto ID:", req.params.id);
        
        await ProductosService.actualizarProducto(req.params.id, req.body);
        res.redirect('/productos');
        
    } catch (error) {
        console.error("Error actualizando:", error.message);
        res.status(500).send("No se pudo actualizar el producto: " + error.message);
    }
});

router.post('/delete/:id', async (req, res) => {
    try {
        console.log("Eliminando producto ID:", req.params.id);
        
        await ProductosService.eliminarProducto(req.params.id);
        res.redirect('/productos');
        
    } catch (error) {
        console.error("Error eliminando:", error.message);
        res.status(500).send("No se pudo eliminar el producto: " + error.message);
    }
});

module.exports = router;