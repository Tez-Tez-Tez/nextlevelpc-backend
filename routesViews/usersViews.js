const express = require('express');
const router = express.Router();
const UsuariosService = require('../services/UsuariosService');

// LISTAR usuarios
router.get('/', async (req, res) => {
    try {
        const usuarios = await UsuariosService.obtenerRoles(); 
        res.render('usuarios/index', {
            title: 'Gestión de Usuarios',
            currentPage: 'usuarios',
            usuarios,
            message: req.query.message,
            error: req.query.error
        });
    } catch (error) {
        res.render('usuarios/index', {
            title: 'Gestión de Usuarios',
            currentPage: 'usuarios',
            usuarios: [],
            error: error.message
        });
    }
});

// FORMULARIO CREAR
router.get('/create', async (req, res) => {
    try {
        res.render('usuarios/create', {
            title: 'Crear Usuario',
            currentPage: 'usuarios',
            error: req.query.error
        });
    } catch (error) {
        res.redirect('/usuarios?error=' + encodeURIComponent(error.message));
    }
});

// FORMULARIO EDITAR
router.get('/edit/:id', async (req, res) => {
    try {
        const usuario = await UsuariosService.obtenerPorId(req.params.id);
        if (!usuario) return res.redirect('/usuarios?error=Usuario no encontrado');
        res.render('usuarios/edit', {
            title: 'Editar Usuario',
            currentPage: 'usuarios',
            usuario,
            error: req.query.error
        });
    } catch (error) {
        res.redirect('/usuarios?error=' + encodeURIComponent(error.message));
    }
});

// CREAR
router.post('/crear', async (req, res) => {
    try {
        await UsuariosService.crear(req.body);
        
        res.redirect('/usuarios?message=Usuario creado exitosamente');
    } catch (error) {
        res.redirect('/usuarios/create?error=' + encodeURIComponent(error.message));
    }
});

// ACTUALIZAR
router.post('/update/:id', async (req, res) => {
    try {
        const id = req.params.id;
        // Mapeo de rol texto → rol_id numérico
        const rolesMap = { admin: 1, cliente: 2, empleado: 3 };
        req.body.rol_id = rolesMap[req.body.rol] || 2;
        req.body.estado = req.body.estado === '1' ? 'activo' : 'inactivo';

        await UsuariosService.actualizar(id, req.body);
        res.redirect('/usuarios?message=Usuario actualizado exitosamente');
    } catch (error) {
        res.redirect('/usuarios/edit/' + id + '?error=' + encodeURIComponent(error.message));
    }
});

// ELIMINAR
router.post('/delete/:id', async (req, res) => {
    try {
        await UsuariosService.eliminar(req.params.id);
        res.redirect('/usuarios?message=Usuario eliminado exitosamente');
    } catch (error) {
        res.redirect('/usuarios?error=' + encodeURIComponent(error.message));
    }
});

module.exports = router;