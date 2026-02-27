const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
  },
});

// Verificación de conexión
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error adquiriendo cliente', err.stack);
  }
  console.log('Conectado exitosamente a Neon (PostgreSQL)');
  release();
});

module.exports = pool;