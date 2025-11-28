const jwt = require('jsonwebtoken');

// Middleware para proteger vistas EJS según rol
// Usa el token de acceso enviado en la cookie "accessToken" o en el header Authorization

function viewAuth(rolesPermitidos = []) {
  return (req, res, next) => {
    try {
      const authHeader = req.headers['authorization'];
      const headerToken = authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : null;

      const cookieToken = req.cookies && req.cookies.accessToken;
      const token = headerToken || cookieToken;

      if (!token) {
        return res.status(401).send('No autorizado. Inicia sesión para acceder a esta página.');
      }

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'fallback_access_key');
      req.usuario = decoded;

      if (rolesPermitidos.length && !rolesPermitidos.includes(decoded.rol)) {
        return res.status(403).send('No tienes permisos para acceder a esta página.');
      }

      next();
    } catch (err) {
      console.error('Error en viewAuth:', err.message);
      return res.status(401).send('Sesión inválida o expirada. Vuelve a iniciar sesión.');
    }
  };
}

module.exports = viewAuth;
