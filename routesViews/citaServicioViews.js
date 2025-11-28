const express = require('express');
const router = express.Router();
const CitasServicioService = require('../services/CitaServicioService');
const ServiciosService = require('../services/ServicioService');

// LISTAR citas
router.get('/', async (req, res) => {
    try {
        const citas = await CitasServicioService.getAllCitas();
        res.render('dashboard/index', {
            title: 'Gestión de Citas de Servicio',
            currentPage: 'dashboard',
            citas,
            message: req.query.message,
            error: req.query.error
        });
    } catch (error) {
        res.render('dashboard/index', {
            title: 'Gestión de Citas de Servicio',
            currentPage: 'dashboard',
            citas: [],
            error: error.message
        });
    }
});

// FORMULARIO CREAR
router.get('/create', async (req, res) => {
    try {
        const servicios = await ServiciosService.getAllServicios();
        res.render('dashboard/create', {
            title: 'Crear Cita de Servicio',
            currentPage: 'dashboard',
            servicios,
            error: req.query.error
        });
    } catch (error) {
        res.redirect('/dashboard?error=' + encodeURIComponent(error.message));
    }
});

// FORMULARIO EDITAR
router.get('/edit/:id', async (req, res) => {
    try {
        const cita = await CitasServicioService.obtenerPorId(req.params.id);
        if (!cita) return res.redirect('/dashboard?error=Cita no encontrada');
        const servicios = await ServiciosService.getAllServicios();
        res.render('dashboard/edit', {
            title: 'Editar Cita de Servicio',
            currentPage: 'dashboard',
            cita,
            servicios,
            error: req.query.error
        });
    } catch (error) {
        res.redirect('/dashboard?error=' + encodeURIComponent(error.message));
    }
});

// CREAR
router.post('/crear', async (req, res) => {
    try {
        await CitasServicioService.createCita(req.body);
        res.redirect('/dashboard?message=Cita creada exitosamente');
    } catch (error) {
        res.redirect('/dashboard/create?error=' + encodeURIComponent(error.message));
    }
});

// ACTUALIZAR
router.post('/update/:id', async (req, res) => {
    try {
        await CitasServicioService.actualizar(req.params.id, req.body);
        res.redirect('/dashboard?message=Cita actualizada exitosamente');
    } catch (error) {
        res.redirect('/dashboard/edit/' + req.params.id + '?error=' + encodeURIComponent(error.message));
    }
});

// ELIMINAR
router.post('/delete/:id', async (req, res) => {
    try {
        await CitasServicioService.deleteCita(req.params.id);
        res.redirect('/dashboard?message=Cita eliminada exitosamente');
    } catch (error) {
        res.redirect('/dashboard?error=' + encodeURIComponent(error.message));
    }
});

module.exports = router;