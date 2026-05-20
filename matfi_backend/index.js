import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';

// Importar rutas
import authRoutes from './src/routes/authRoutes.js';
import ingredienteRoutes from './src/routes/ingredienteRoutes.js';
import ejercicioRoutes from './src/routes/ejercicioRoutes.js';
import recetaRoutes from './src/routes/recetaRoutes.js';
import rutinaRoutes from './src/routes/rutinaRoutes.js';
import metaFisicaRoutes from './src/routes/metaFisicaRoutes.js';
import registroActividadFisicaRoutes from './src/routes/registroActividadFisicaRoutes.js';
import registroIngestaAlimenticiRoutes from './src/routes/registroIngestaAlimenticiRoutes.js';
import estadisticasRoutes from './src/routes/estadisticasRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// Swagger: servir UI que carga el spec desde /api/swagger.json dinámico
// Montar bajo /api/* ayuda en hosting como Vercel donde las rutas raíz pueden servir HTML estático
const swaggerUiOptions = {
  swaggerUrl: '/api/swagger.json',
  customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.8/swagger-ui.min.css',
  customJs: [
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.8/swagger-ui-bundle.js',
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.8/swagger-ui-standalone-preset.js'
  ]
};
app.use('/api/api-docs', swaggerUi.serve, swaggerUi.setup(null, swaggerUiOptions));
app.get('/api/swagger.json', (req, res) => {
  // Determinar URL base en tiempo de ejecución:
  // 1) usar process.env.SWAGGER_BASE_URL si está definida (útil en hosting)
  // 2) si no, construir a partir de la request (protocol + host)
  const configured = process.env.SWAGGER_BASE_URL || process.env.API_URL;
  const protocol = req.protocol;
  const host = req.get('host');
  const baseUrl = configured || `${protocol}://${host}`;

  // Clonar el spec para no mutar el objeto importado
  const spec = JSON.parse(JSON.stringify(swaggerSpec));
  // Ajustar base para rutas montadas bajo /api en Vercel: si el spec se sirve en /api,
  // y la URL base detectada apunta al host raíz, dejar la URL de la API como `${baseUrl}/api`.
  const apiBase = configured || `${protocol}://${host}`;
  spec.servers = [
    { url: apiBase, description: 'Auto-detected server' }
  ];

  // Mantener localhost como opción si no se configuró explicitamente
  if (!configured) {
    spec.servers.push({ url: 'http://localhost:3000', description: 'Local development' });
  }

  res.json(spec);
});

// Definir rutas
app.use('/api/auth', authRoutes);
app.use('/api/ingredientes', ingredienteRoutes);
app.use('/api/ejercicios', ejercicioRoutes);
app.use('/api/recetas', recetaRoutes);
app.use('/api/rutinas', rutinaRoutes);
app.use('/api/metaFisica', metaFisicaRoutes);
app.use('/api/registrosActividad', registroActividadFisicaRoutes);
app.use('/api/registrosIngesta', registroIngestaAlimenticiRoutes);
app.use('/api/estadisticas', estadisticasRoutes);

app.get('/', (req, res) => {
  res.send('API de MatFi Backend funcionando 🚀. Documentación: http://localhost:3000/api-docs');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Documentación Swagger disponible en http://localhost:${PORT}/api-docs`);
});