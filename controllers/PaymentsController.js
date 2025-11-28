const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const OrdenesService = require('../services/OrdenesService');
const OrdenItemsService = require('../services/OrdenItemsService');
const CitaServicioService = require('../services/CitaServicioService');
const { OrdenCreateDTO } = require('../dto/OrdenesDTO');

class PaymentsController {

  static async createPaymentIntent(req, res) {
    try {
      const { amount, currency = 'cop', metadata = {}, amount_cents } = req.body;

      console.log('--- createPaymentIntent - request body ---');
      // console.log(JSON.stringify(req.body).slice(0, 200)); 
      console.log('Metadata keys:', Object.keys(metadata || {}));
      if (metadata && metadata.citaData) {
        console.log('citaData recibida:', metadata.citaData);
      }

      // Validación básica del monto
      if ((amount === undefined || amount === null) && (amount_cents === undefined || amount_cents === null)) {
        return res.status(400).json({ success: false, mensaje: 'El monto es requerido.' });
      }

      // Normalizar monto a centavos
      let amountInCents;
      if (amount_cents !== undefined && amount_cents !== null) {
        amountInCents = Math.round(Number(amount_cents));
      } else {
        // El frontend ya envía 'amount' en centavos, NO multiplicar por 100 de nuevo
        const num = Number(amount);
        if (Number.isNaN(num)) {
          return res.status(400).json({ success: false, mensaje: 'El campo amount debe ser numérico.' });
        }
        amountInCents = Math.round(num);
      }

      if (!Number.isFinite(amountInCents) || amountInCents <= 0) {
        return res.status(400).json({ success: false, mensaje: 'El monto debe ser mayor a 0.' });
      }

      // **NUEVO: Validar monto mínimo para COP**
      if (currency.toLowerCase() === 'cop') {
        // Stripe requiere mínimo ~$2,000 COP (equivalente a ~$0.50 USD)
        const MINIMUM_AMOUNT_COP = 2000; // 2,000 COP = ~$0.50 USD
        
        if (amountInCents < MINIMUM_AMOUNT_COP) {
          return res.status(400).json({
            success: false,
            mensaje: `El monto mínimo de pago es ${(MINIMUM_AMOUNT_COP / 100).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}.`
          });
        }
      }

      // Verificar usuario autenticado
      if (!req.usuario) {
        return res.status(401).json({ success: false, mensaje: 'Usuario no autenticado' });
      }

      const clienteId = req.usuario.id ?? req.usuario.idusuario;
      const clienteEmail = req.usuario.correo ?? req.usuario.email ?? 'no-email';

      // **CREAR LA ORDEN USANDO TU SERVICIO**
      let productos = [];
      let tipo = 'producto'; // default

      // Parsear productos del metadata
      if (metadata.productos) {
        try {
          productos = typeof metadata.productos === 'string'
          ? JSON.parse(metadata.productos)
          : metadata.productos;

          //Determinar tipo basado en TODOS los productos
          const tieneProductos = productos.some(p => p.type === 'producto');
          const tieneServicios = productos.some(p => p.type === 'servicio');

          if (tieneProductos && tieneServicios) {
          tipo = 'mixto';
          } else if (tieneServicios) {
          tipo = 'servicio';
          } else {
          tipo = 'producto';
          }

          console.log(`Tipo de orden detectado: ${tipo}`);
          } catch (e) {
          console.error('Error parseando productos:', e);
          }
        }

      // Crear orden usando tu DTO y servicio
      const ordenDTO = new OrdenCreateDTO({
        cliente_id: clienteId,
        tipo: tipo,
        total: amountInCents / 100 // Convertir centavos a pesos
      });

      const errors = ordenDTO.validate();
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          mensaje: 'Errores de validación de la orden',
          errors: errors
        });
      }

      console.log('Creando orden en BD...');
      const ordenId = await OrdenesService.crear(ordenDTO);
      const ordenCreada = await OrdenesService.obtenerPorId(ordenId);

      console.log('Orden creada:', ordenCreada.numero_orden);

      // Insertar items de la orden si hay productos
      if (productos.length > 0) {
        console.log(`Insertando ${productos.length} items...`);

        for (const prod of productos) {
          try {
            // Para servicios, producto_id debe ser NULL para evitar error de FK con tabla productos
            const isService = (prod.type || tipo) === 'servicio';

          await OrdenItemsService.crear({
          orden_id: ordenId,
          producto_id: isService ? null : (prod.id || null),
          servicio_id: isService ? (prod.id || null) : null, 
          tipo: prod.type || tipo,
          descripcion: prod.nombre || 'Sin descripción',
          cantidad: prod.cantidad || 1,
          precio_unitario: prod.precio || 0,
          subtotal: (prod.precio || 0) * (prod.cantidad || 1)
          });
          } catch (itemError) {
            console.error('Error insertando item:', itemError);
          }
        }

        // Recalcular total de la orden
        await OrdenesService.actualizarTotal(ordenId);
        console.log('Total de orden actualizado');
      }

      // Preparar metadata segura para Stripe
      const safeMetadata = {
        orden_id: ordenId.toString(),
        numero_orden: ordenCreada.numero_orden,
        cliente_id: clienteId.toString(),
        cliente_email: clienteEmail,
        tipo: tipo
      };

      //Agregar datos de cita si el pago es para un servicio
      if (metadata.citaData) {
        const citaData = typeof metadata.citaData === 'string'
          ? JSON.parse(metadata.citaData)
          : metadata.citaData;

        // Agregar servicio_id
        // Prioridad 1: Si viene en citaData (lo agregaremos en el frontend)
        if (citaData.servicio_id) {
          safeMetadata.servicio_id = citaData.servicio_id.toString();
        }
        // Prioridad 2: Buscar en productos el que coincida (si hubiera lógica para ello) o usar el primero como fallback
        else if (productos.length > 0 && productos[0].id) {
          safeMetadata.servicio_id = productos[0].id.toString();
        }

        console.log('safeMetadata preparado (con cita):', safeMetadata);

        // Limitar cada campo a 500 caracteres (límite de Stripe para metadata)
        safeMetadata.cita_nombre = (citaData.nombre_cliente || citaData.nombre || '').slice(0, 500);
        safeMetadata.cita_email = (citaData.email_cliente || citaData.email || '').slice(0, 500);
        safeMetadata.cita_telefono = (citaData.telefono_cliente || citaData.telefono || '').slice(0, 500);
        safeMetadata.cita_direccion = (citaData.direccion_cliente || citaData.direccion || '').slice(0, 500);
        safeMetadata.cita_fecha = (citaData.fecha_cita || citaData.fecha || '').slice(0, 500);
        safeMetadata.cita_descripcion = (citaData.descripcion_problema || citaData.descripcion || '').slice(0, 500);
      }

      // Agregar info compacta de productos
      if (productos.length > 0) {
        const productosCompactos = productos.map(p => ({
          id: p.id,
          nombre: p.nombre?.slice(0, 50) || 'Producto',
          cant: p.cantidad || 1
        }));
        safeMetadata.productos_info = JSON.stringify(productosCompactos).slice(0, 400);
      }

      // Crear PaymentIntent en Stripe
      console.log('Creando PaymentIntent en Stripe...');
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency,
        metadata: safeMetadata,
        automatic_payment_methods: { enabled: true },
      });

      console.log('PaymentIntent creado:', paymentIntent.id);

      return res.status(200).json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        ordenId: ordenId,
        numeroOrden: ordenCreada.numero_orden
      });

    } catch (error) {
      console.error('Error creating payment intent:', error);

      // Logging detallado del error
      if (error.raw) {
        console.error('Stripe raw error:', error.raw);
      }

      const mensaje = error.message || 'Error al crear la sesión de pago';
      return res.status(500).json({ success: false, mensaje });
    }
  }

  static async handleWebhook(req, res) {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object;
          const ordenId = paymentIntent.metadata.orden_id;
          const numeroOrden = paymentIntent.metadata.numero_orden;

          console.log('--------------------------------');
          console.log('PAGO EXITOSO');
          console.log('PaymentIntent:', paymentIntent.id);
          console.log('Monto:', paymentIntent.amount / 100, paymentIntent.currency.toUpperCase());
          console.log('Orden ID:', ordenId);
          console.log('Número Orden:', numeroOrden);
          console.log('--------------------------------');

          if (ordenId) {
            // Usar tu servicio para actualizar la orden
            const actualizado = await OrdenesService.actualizar(ordenId, {
              estado_pago: 'pagado',
              estado_orden: 'completada'
            });

            if (actualizado) {
              console.log('Orden actualizada exitosamente en BD');

              // NUEVO: Si hay datos de cita en metadata, crearla AHORA
              const metadata = paymentIntent.metadata;
              console.log('Webhook metadata:', metadata);

              if (metadata.cita_nombre && metadata.servicio_id) {
                try {
                  console.log('Creando cita automática desde webhook...');
                  const citaData = {
                    servicio_id: metadata.servicio_id,
                    nombre: metadata.cita_nombre,
                    email: metadata.cita_email,
                    telefono: metadata.cita_telefono,
                    direccion: metadata.cita_direccion,
                    fecha: metadata.cita_fecha,
                    descripcion: metadata.cita_descripcion,
                    estado: 'confirmada',
                    estado_pago: 'pagado',
                    orden_id: ordenId
                  };

                  const nuevaCita = await CitaServicioService.crear(citaData);

                  // Vincular cita con orden (actualización inversa)
                  await OrdenesService.actualizar(ordenId, {
                    cita_servicio_id: nuevaCita.id
                  });

                  console.log('Cita creada y pagada exitosamente:', nuevaCita.id);
                } catch (citaError) {
                  console.error('Error creando cita automática:', citaError);
                }
              }
            } else {
              console.error('No se pudo actualizar la orden:', ordenId);
            }
          } else {
            console.error('No se encontró orden_id en metadata');
          }

          break;
        }

        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object;
          const ordenId = paymentIntent.metadata.orden_id;
          const error = paymentIntent.last_payment_error;

          console.log('----------------------------------------');
          console.log('PAGO FALLIDO');
          console.log('PaymentIntent:', paymentIntent.id);
          console.log('Orden ID:', ordenId);
          console.log('Error:', error?.message || 'Desconocido');
          console.log('----------------------------------------');

          if (ordenId) {
            await OrdenesService.actualizar(ordenId, {
              estado_orden: 'cancelada'
            });
            console.log('Orden marcada como cancelada');
          }

          break;
        }

        case 'payment_intent.canceled': {
          const paymentIntent = event.data.object;
          const ordenId = paymentIntent.metadata.orden_id;

          console.log('Pago cancelado - Orden:', ordenId);

          if (ordenId) {
            await OrdenesService.actualizar(ordenId, {
              estado_orden: 'cancelada'
            });
          }

          break;
        }

        default:
          console.log(`Evento no manejado: ${event.type}`);
      }
    } catch (dbError) {
      console.error('Error procesando webhook en BD:', dbError);
      // Aún así devolvemos 200 a Stripe para evitar reintentos
    }

    res.json({ received: true });
  }
}

module.exports = PaymentsController;