import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Importar rutas
import authRoutes from './src/routes/authRoutes.js';
import ingredienteRoutes from './src/routes/ingredienteRoutes.js';
import ejercicioRoutes from './src/routes/ejercicioRoutes.js';
import recetaRoutes from './src/routes/recetaRoutes.js';
import rutinaRoutes from './src/routes/rutinaRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// Definir rutas
app.use('/api/auth', authRoutes);
app.use('/api/ingredientes', ingredienteRoutes);
app.use('/api/ejercicios', ejercicioRoutes);
app.use('/api/recetas', recetaRoutes);
app.use('/api/rutinas', rutinaRoutes);

app.get('/', (req, res) => {
  res.send('API de MatFi Backend funcionando 🚀');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});