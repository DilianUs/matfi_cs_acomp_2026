import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '../swagger.js';

// Importar rutas
import authRoutes from './routes/authRoutes.js';
import ingredienteRoutes from './routes/ingredienteRoutes.js';
import ejercicioRoutes from './routes/ejercicioRoutes.js';
import recetaRoutes from './routes/recetaRoutes.js';
import rutinaRoutes from './routes/rutinaRoutes.js';
import metaFisicaRoutes from './routes/metaFisicaRoutes.js';
import registroActividadFisicaRoutes from './routes/registroActividadFisicaRoutes.js';
import registroIngestaAlimenticiRoutes from './routes/registroIngestaAlimenticiRoutes.js';
import estadisticasRoutes from './routes/estadisticasRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

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
  const configured = process.env.SWAGGER_BASE_URL || process.env.API_URL;
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.get('host');
  const baseUrl = configured || `${protocol}://${host}`;

  const spec = JSON.parse(JSON.stringify(swaggerSpec));
  const apiBase = configured || `${protocol}://${host}`;
  spec.servers = [
    { url: apiBase, description: 'Auto-detected server' }
  ];

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

export default app;
