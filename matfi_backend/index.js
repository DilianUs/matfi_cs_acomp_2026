const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar rutas
const usuarioRoutes = require('./src/routers/usuarioRouters');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json()); // Importante para recibir JSON en el body

// Definir rutas
app.use('/api/usuarios', usuarioRoutes);

app.get('/', (req, res) => {
  res.send('API de Matfi Backend funcionando 🚀');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});