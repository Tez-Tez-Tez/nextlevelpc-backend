const express = require('express');
const router = express.Router();
const ordenesService = require('../services/OrdenesService.js');
const UsuariosService = require('../services/UsuariosService.js');
const ordenItemsService = require('../services/OrdenItemsService.js');
const ProductosService = require('../services/ProductosService.js');
const {OrdenCreateDTO,OrdenUpdateDTO} = require('../dto/OrdenesDTO.js')

//RUTAS PARA VISTAS DE ÓRDENES (HTML)
router.get('/', async (req, res) =>{
        try {
            const ordenes = await ordenesService.obtenerTodos();
            res.render('ordenes/list', { 
title: 'Gestión de Órdenes',
  currentPage: 'ordenes',
  ordenes,
  busqueda: req.query.busqueda || '', 
  estadoSeleccionado: req.query.estado || '',
  message: req.query.message,
  error: req.query.error
            });
        } catch (error) {
            res.render('ordenes/list', { 
                ordenes: [],
                error: error.message 
            });
        }
    });
router.get('/create', async (req, res) =>{
        try {
            // Obtener clientes para el dropdown
            const clientes = await UsuariosService.obtenerTodos();
            res.render('ordenes/create', { 
                clientes: clientes,
                error: req.query.error
            });
        } catch (error) {
            res.render('ordenes/create', { 
                clientes: [],
                error: error.message 
            });
        }
    });
router.get('/:id', async(req, res)=> {
        try {
            const ordenId = req.params.id;
            const orden = await ordenesService.obtenerPorId(ordenId);
            const items = await ordenItemsService.obtenerPorOrden(ordenId);
            const productos = await ProductosService.obtenerTodos(); // Para dropdown
            
            res.render('ordenes/detail', { 
                orden: orden,
                items: items,
                productos: productos,
                message: req.query.message,
                error: req.query.error
            });
        } catch (error) {
            res.redirect('/ordenes?error=' + encodeURIComponent(error.message));
        }
    }
);
router.get('/edit/:id', async (req, res) => {
        try {
            const ordenId = req.params.id;
            const orden = await ordenesService.obtenerPorId(ordenId);
            const clientes = await UsuariosService.obtenerTodos(); // Ajusta según tu servicio
            
            res.render('ordenes/edit', { 
                orden: orden,
                clientes: clientes,
                error: req.query.error
            });
        } catch (error) {
            res.redirect('/ordenes?error=' + encodeURIComponent(error.message));
        }
    });


//RUTAS PARA FORMULARIOS HTML
router.post('/crear', async(req, res)=> {
        try {
            const ordenDTO = new OrdenCreateDTO(req.body);
            const errors = ordenDTO.validate();
            
            if (errors.length > 0) {
                return res.redirect('/ordenes/create?error=' + encodeURIComponent(errors.join(', ')));
            }

            const insertId = await ordenesService.crear(ordenDTO);
            
            // Redirigir a la vista de detalle de la nueva orden
            res.redirect('/ordenes/' + insertId + '?message=Orden creada exitosamente');
            
        } catch (error) {
            res.redirect('/ordenes/create?error=' + encodeURIComponent(error.message));
        }
    });
router.post('/update/:id',async (req, res) =>{
        try {
            const id = req.params.id;
            const ordenDTO = new OrdenUpdateDTO(req.body);
            const errors = ordenDTO.validate();
            
            if (errors.length > 0) {
                return res.redirect('/ordenes/edit/' + id + '?error=' + encodeURIComponent(errors.join(', ')));
            }

            const actualizado = await ordenesService.actualizar(id, ordenDTO);

            if (!actualizado) {
                return res.redirect('/ordenes/edit/' + id + '?error=Orden no encontrada');
            }

            res.redirect('/ordenes/' + id + '?message=Orden actualizada exitosamente');
            
        } catch (error) {
            res.redirect('/ordenes/edit/' + id + '?error=' + encodeURIComponent(error.message));
        }
    });

    // ELIMINAR ORDEN
router.post('/delete/:id', async (req, res) => {
    try {
        const id = req.params.id;

        //validar que la orden existe
        const orden = await ordenesService.obtenerPorId(id);
        if (!orden) {
            return res.redirect('/ordenes?error=Orden no encontrada');
        }

        // Eliminar la orden 
        await ordenesService.eliminar(id);

        res.redirect('/ordenes?message=Orden eliminada exitosamente');
    } catch (error) {
        res.redirect('/ordenes?error=' + encodeURIComponent(error.message));
    }
});

module.exports = router;