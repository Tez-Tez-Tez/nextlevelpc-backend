# NextLevelPC - Backend API

Backend Express.js + PostgreSQL (Supabase) + Stripe para la tienda NextLevelPC.

## Características

- ✅ Express.js API
- ✅ Autenticación JWT
- ✅ PostgreSQL via Supabase
- ✅ Integración Stripe (pagos)
- ✅ Gestión de órdenes, productos y servicios
- ✅ Sistema de citas para servicios

## Tech Stack

- **Runtime**: Node.js 22.14.0
- **Framework**: Express.js 4.21.2
- **Database**: PostgreSQL (Supabase)
- **Auth**: JWT + bcryptjs
- **Payments**: Stripe
- **ORM**: Supabase PostgREST API

## Instalación Local

```bash
# Clonar el repositorio
git clone https://github.com/ToroDevelloper/nextlevelpc-backend.git
cd nextlevelpc-backend

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.production .env

# Completar variables en .env con tus valores locales
# Para desarrollo:
# - SUPABASE_URL: URL de tu proyecto Supabase
# - SUPABASE_SERVICE_ROLE_KEY: Tu service role key
# - JWT_ACCESS_SECRET: Clave temporal para desarrollo
# - JWT_REFRESH_SECRET: Clave temporal para desarrollo
# - STRIPE_SECRET_KEY: sk_test_xxxxx (para testing)
# - NODE_ENV: development

# Iniciar en desarrollo
npm run dev

# O para producción
npm start
```

## Variables de Entorno

```env
# Base de datos
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# Autenticación
JWT_ACCESS_SECRET=tu_clave_acceso_minimo_32_caracteres
JWT_REFRESH_SECRET=tu_clave_refresh_minimo_32_caracteres

# Stripe
STRIPE_PUBLIC_KEY=pk_live_xxxxx (o pk_test_xxxxx para desarrollo)
STRIPE_SECRET_KEY=sk_live_xxxxx (o sk_test_xxxxx para desarrollo)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Entorno
NODE_ENV=production|development
PORT=3000 (por defecto 8080 en desarrollo)
FRONTEND_URL=https://tu-frontend.vercel.app
```

## Endpoints Principales

### Autenticación

- `POST /api/usuarios/registro` - Registrar usuario
- `POST /api/usuarios/login` - Iniciar sesión
- `POST /api/usuarios/refresh-tokens` - Refrescar tokens

### Productos

- `GET /api/productos` - Obtener todos
- `GET /api/productos/:id` - Obtener por ID
- `POST /api/productos` - Crear (admin)
- `PATCH /api/productos/:id` - Actualizar (admin)

### Órdenes

- `GET /api/ordenes` - Listar órdenes
- `GET /api/ordenes/:id` - Obtener orden
- `POST /api/ordenes` - Crear orden

### Pagos

- `POST /api/payments/create-payment-intent` - Crear pago Stripe
- `POST /api/payments/webhook` - Webhook de Stripe

## Deployment en Railway

1. Conectar GitHub a Railway
2. Crear nuevo proyecto y seleccionar este repo
3. Configurar variables de entorno en Railway
4. Railway automáticamente deployará en cada push

URL: `https://nextlevelpc-backend-production.railway.app`

## Testing

```bash
# Test de conexión
curl http://localhost:8080/api/health

# Test de productos
curl http://localhost:8080/api/productos
```

## Estructura de Carpetas

```
.
├── config/          # Configuración (Supabase, DB)
├── controllers/     # Lógica de rutas
├── dto/            # Data Transfer Objects
├── middlewares/    # Middlewares Express
├── models/         # Modelos de datos (Supabase queries)
├── routes/         # Rutas API
├── services/       # Lógica de negocio
├── views/          # Templates EJS
├── index.js        # Entrada principal
├── Procfile        # Para Railway
└── package.json    # Dependencias
```

## Documentación Completa

Ver `DEPLOYMENT_GUIDE.md` para instrucciones de deployment completas.

## Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

ISC

## Autor

NextLevelPC Team
