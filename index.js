const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const expressLayouts = require('express-ejs-layouts');
const helmet = require('helmet');
const { globalLimiter, authLimiter, createLimiter } = require('./config/limiter');
require('dotenv').config();

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com", "https://cdn.jsdelivr.net"],
        frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"],
        connectSrc: ["'self'", "https://api.stripe.com", "https://nextlevelpc-frontend-vite.vercel.app", "https://web-production-048cf.up.railway.app"],
      },
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    frameguard: { action: "deny" },
    hidePoweredBy: true,
  })
);

app.use(globalLimiter);


// Normaliza los orígenes (quita barra final para evitar duplicados)
const normalizeOrigin = (origin) => origin?.replace(/\/+$/, '');

const allowedOrigins = [
  'https://web-production-048cf.up.railway.app',
  'https://nextlevelpc-frontend-vite.vercel.app',
  'https://nextlevelpc.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174',
].map(normalizeOrigin);

const corsOptions = {
  origin: (origin, callback) => {
    // Permite herramientas sin origen (Postman, curl, etc.)
    if (!origin || allowedOrigins.includes(normalizeOrigin(origin))) {
      callback(null, true);
    } else {
      console.warn(`CORS bloqueado para origen: ${origin}`);
      callback(new Error('Origen no permitido por CORS'));
    }
  },
  credentials: true, // Importante si usas cookies/sesiones/auth
  optionsSuccessStatus: 200,
};

// Aplica CORS una sola vez
app.use(cors(corsOptions));

app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (Object.keys(req.body).length && req.path !== '/api/payments/webhook') {
    console.log('Body:', req.body);
  }
  next();
});


const categoriasRoutes = require('./routes/Categorias');
const serviciosRoutes = require('./routes/servicios');
const productosRoutes = require('./routes/Productos');
const rolesRoutes = require('./routes/roles');
const usuariosRoutes = require('./routes/usuarios');
const ordenesRoutes = require('./routes/Ordenes');
const ordenItemsRoutes = require('./routes/OrdenItems');
const imagenProductoRoutes = require('./routes/imagenProductoRoutes');
const citasServiciosRoutes = require('./routes/citasServicios');
const paymentsRoutes = require('./routes/payments');

// Vistas
const productosViews = require('./routesViews/productosViews');
const ordenesViews = require('./routesViews/ordenesViews');
const citasServiciosViews = require('./routesViews/citaServicioViews');
const usersViews = require('./routesViews/usersViews');

app.use('/productos', productosViews);
app.use('/ordenes', ordenesViews);
app.use('/dashboard', citasServiciosViews);
app.use('/usuarios', usersViews);

app.use('/api/categorias', categoriasRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/usuarios', authLimiter, usuariosRoutes);
app.use('/api/ordenes', createLimiter, ordenesRoutes);
app.use('/api/ordenitems', ordenItemsRoutes);
app.use('/api/imagenes-producto', imagenProductoRoutes);
app.use('/api/citas-servicios', createLimiter, citasServiciosRoutes);
app.use('/api/payments', paymentsRoutes);

// Health check y rutas restantes...


const { testConnection } = require('./config/db');

app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = await testConnection();
    res.json({
      status: 'OK',
      message: 'Backend NextLevelPC funcionando',
      database: dbStatus ? 'Conectado' : 'Desconectado',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: 'Error en health check' });
  }
});

app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenido a NextLevelPC Backend API',
    version: '1.0.0',
    docs: 'https://tu-dominio.com/api/health',
  });
});

// Errores y 404
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, message: 'Error interno del servidor' });
});

app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});


const PORT = process.env.BACKEND_PORT || 8080;

const startServer = async () => {
  try {
    console.log('Conectando a la base de datos...');
    const connected = await testConnection();
    if (!connected) throw new Error('No se pudo conectar a MySQL');

    app.listen(PORT, '0.0.0.0', () => {
      console.log('BACKEND NEXTLEVELPC INICIADO');
      console.log(`Puerto: ${PORT}`);
      console.log(`URL: http://localhost:${PORT}`);
      console.log(`Health: http://localhost:${PORT}/api/health`);
      console.log(`Helmet + CORS configurados correctamente`);
    });
  } catch (err) {
    console.error('Error crítico al iniciar:', err);
    process.exit(1);
  }
};

startServer();