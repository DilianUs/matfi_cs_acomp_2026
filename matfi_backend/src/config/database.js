import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
  },
});

// Verificación de conexión
if (process.env.NODE_ENV !== 'test') {
  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error adquiriendo cliente', err.stack);
    }
    console.log('Conectado exitosamente a Neon (PostgreSQL)');
    release();
  });
}

export default pool;
