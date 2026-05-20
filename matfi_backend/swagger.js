import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MatFi Backend API',
      version: '1.0.0',
      description: `
        # API para la plataforma de fitness y nutrición MatFi

        ## ⚠️ INSTRUCCIONES DE AUTENTICACIÓN - LEE PRIMERO

        Para probar cualquier endpoint **protegido**, debes tener un token JWT válido. Sigue estos pasos:

        ### 1. Registrar un nuevo usuario (si no tienes cuenta)
        - Ve al endpoint **POST /api/auth/register** en la sección "Autenticación"
        - Completa los campos requeridos (nombreUsuario, correoUsuario, contraseniaUsuario)
        - Haz clic en "Try it out" y ejecuta
        - Copia el **token** de la respuesta

        ### 2. Iniciar sesión (Login)
        - Ve al endpoint **POST /api/auth/login** en la sección "Autenticación"
        - Usa el correo y contraseña que registraste
        - Haz clic en "Try it out" y ejecuta
        - Copia el **token** de la respuesta

        ### 3. Autorizar en Swagger (IMPORTANTE)
        - Haz clic en el botón **"Authorize"** en la esquina superior derecha (el ícono del candado 🔒)
        - Pega el token en el campo que aparecerá
        - Haz clic en "Authorize" en el modal
        - Ahora todos los endpoints protegidos incluirán automáticamente tu token

        ### 4. Prueba los endpoints
        - Todos los endpoints con el ícono 🔒 requieren autenticación
        - Ya está configurado automáticamente después del paso 3
        - Los endpoints sin 🔒 son públicos (solo register y login)

        ## Endpoints principales:
        - **Autenticación**: register, login, getProfile, updateProfile
        - **Meta Física**: CRUD completo
        - **Registro Actividad Física**: crear, actualizar, agregar rutinas
        - **Registro Ingesta Alimenticia**: crear, actualizar, agregar recetas
        - **Estadísticas**: historial consolidado y métricas

        ## Nota sobre los datos de ejemplo:
        Los datos mostrados en los esquemas son solo ejemplos. Usa tus propios valores según sea necesario.
      `,
      contact: {
        name: 'MatFi Support',
        email: 'support@matfi.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de Desarrollo'
      },
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: 'Servidor de Producción'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT para autenticación. Incluir en header: Authorization: Bearer <token>'
        }
      },
      schemas: {
        Usuario: {
          type: 'object',
          properties: {
            idUsuario: { type: 'integer', example: 1 },
            nombreUsuario: { type: 'string', example: 'Juan Pérez' },
            edadUsuario: { type: 'integer', example: 25 },
            generoUsuario: { type: 'string', example: 'Masculino' },
            estaturaUsuario: { type: 'number', example: 1.75 },
            pesoUsuario: { type: 'number', example: 75.5 },
            correoUsuario: { type: 'string', example: 'juan@example.com' }
          }
        },
        MetaFisica: {
          type: 'object',
          properties: {
            idMeta: { type: 'integer', example: 1 },
            idUsuario: { type: 'integer', example: 1 },
            tipoDeMetaFisica: { 
              type: 'string', 
              enum: ['perdida', 'ganancia', 'mantenimiento'],
              example: 'perdida'
            },
            caloriasObjetivo: { type: 'number', example: 2000 },
            fechaInicio: { type: 'string', format: 'date', example: '2026-05-20' },
            fechaFin: { type: 'string', format: 'date', example: '2026-08-20' }
          }
        },
        RegistroActividadFisica: {
          type: 'object',
          properties: {
            idRegistroActividad: { type: 'integer', example: 1 },
            idUsuario: { type: 'integer', example: 1 },
            fecha: { type: 'string', format: 'date', example: '2026-05-20' },
            caloriasQuemadas: { type: 'integer', example: 500 },
            tiempoInvertido: { type: 'number', example: 60.5 },
            nivelDeIntensidad: { 
              type: 'string',
              enum: ['baja', 'media', 'alta'],
              example: 'alta'
            },
            rutinas: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  idRutina: { type: 'integer' },
                  nombreRutina: { type: 'string' }
                }
              }
            }
          }
        },
        RegistroIngestaAlimenticia: {
          type: 'object',
          properties: {
            idRegistroIngesta: { type: 'integer', example: 1 },
            idUsuario: { type: 'integer', example: 1 },
            fecha: { type: 'string', format: 'date', example: '2026-05-20' },
            caloriasConsumidas: { type: 'integer', example: 2000 },
            recetas: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  idReceta: { type: 'integer' },
                  nombreReceta: { type: 'string' },
                  caloriasAproximadas: { type: 'number' }
                }
              }
            }
          }
        },
        HistorialIntegral: {
          type: 'object',
          properties: {
            idHistorial: { type: 'integer' },
            idUsuario: { type: 'integer' },
            fecha: { type: 'string', format: 'date' },
            idRegistroActividad: { type: 'integer' },
            caloriasQuemadas: { type: 'integer' },
            tiempoInvertido: { type: 'number' },
            nivelDeIntensidad: { type: 'string' },
            rutinas: { type: 'array' },
            idRegistroIngesta: { type: 'integer' },
            caloriasConsumidas: { type: 'integer' },
            recetas: { type: 'array' }
          }
        },
        Estadisticas: {
          type: 'object',
          properties: {
            totalRegistrosActividad: { type: 'integer' },
            caloriasQuemadasTotal: { type: 'number' },
            tiempoInvertidoTotal: { type: 'number' },
            caloriasQuemadasPromedio: { type: 'number' },
            tiempoInvertidoPromedio: { type: 'number' },
            totalRegistrosIngesta: { type: 'integer' },
            caloriasConsumidastotal: { type: 'number' },
            caloriasConsumidasPromedio: { type: 'number' },
            totalRutinasDiferentes: { type: 'integer' },
            totalRecetasDiferentes: { type: 'integer' },
            balanceCalorias: { type: 'number' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Mensaje de error' }
          }
        }
      }
    }
  },
  apis: [
    './src/routes/authRoutes.js',
    './src/routes/metaFisicaRoutes.js',
    './src/routes/registroActividadFisicaRoutes.js',
    './src/routes/registroIngestaAlimenticiRoutes.js',
    './src/routes/estadisticasRoutes.js',
    './src/routes/ingredienteRoutes.js',
    './src/routes/ejercicioRoutes.js',
    './src/routes/recetaRoutes.js',
    './src/routes/rutinaRoutes.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
