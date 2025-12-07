const rateLimit = require('express-rate-limit');

// Limiter general para todas las rutas
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Limite de 100 peticiones por IP por ventana
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Demasiadas peticiones desde esta IP, por favor intente nuevamente en 15 minutos.'
    }
});

// Limiter estricto para Login/Registro (prevenir Brute Force)
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 10, // Limite de 10 intentos fallidos (o peticiones totales) por hora
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Demasiados intentos de inicio de sesión. Por favor intente nuevamente en 1 hora.'
    }
});

// Limiter para creación de recursos (evitar spam de citas/ordenes)
const createLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 20, // 20 creaciones por hora
    message: {
        success: false,
        message: 'Has excedido el límite de creación de recursos. Intenta más tarde.'
    }
});

module.exports = {
    globalLimiter,
    authLimiter,
    createLimiter
};
