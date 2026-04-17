import pool from '../config/database.js';

class RutinaModel {
  static async findAll() {
    const query = `
      SELECT r.id_rutina, r.nombre_rutina, r.descripcion_rutina, r.imagen_musculos_trabajados,
             COALESCE(jsonb_agg(jsonb_build_object(
               'idEjercicio', e.id_ejercicio,
               'nombreEjercicio', e.nombre_ejercicio,
               'cantidadSeries', e.cantidad_series,
               'cantidadRepeticiones', e.cantidad_repeticiones,
               'descripcionEjercicio', e.descripcion_ejercicio,
               'videoEjercicio', e.video_ejercicio,
               'orden', re.orden
             ) ORDER BY re.orden) FILTER (WHERE e.id_ejercicio IS NOT NULL), '[]') as ejercicios
      FROM Rutina r
      LEFT JOIN RutinaEjercicio re ON re.id_rutina = r.id_rutina
      LEFT JOIN Ejercicio e ON e.id_ejercicio = re.id_ejercicio
      GROUP BY r.id_rutina
      ORDER BY r.id_rutina;
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT r.id_rutina, r.nombre_rutina, r.descripcion_rutina, r.imagen_musculos_trabajados,
             COALESCE(jsonb_agg(jsonb_build_object(
               'idEjercicio', e.id_ejercicio,
               'nombreEjercicio', e.nombre_ejercicio,
               'cantidadSeries', e.cantidad_series,
               'cantidadRepeticiones', e.cantidad_repeticiones,
               'descripcionEjercicio', e.descripcion_ejercicio,
               'videoEjercicio', e.video_ejercicio,
               'orden', re.orden
             ) ORDER BY re.orden) FILTER (WHERE e.id_ejercicio IS NOT NULL), '[]') as ejercicios
      FROM Rutina r
      LEFT JOIN RutinaEjercicio re ON re.id_rutina = r.id_rutina
      LEFT JOIN Ejercicio e ON e.id_ejercicio = re.id_ejercicio
      WHERE r.id_rutina = $1
      GROUP BY r.id_rutina;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async create(data, exercises = []) {
    const { nombreRutina, descripcionRutina, imagenMusculosTrabajados } = data;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const query = `
        INSERT INTO Rutina (nombre_rutina, descripcion_rutina, imagen_musculos_trabajados)
        VALUES ($1, $2, $3)
        RETURNING id_rutina
      `;
      const result = await client.query(query, [nombreRutina, descripcionRutina, imagenMusculosTrabajados]);
      const idRutina = result.rows[0].id_rutina;

      if (Array.isArray(exercises) && exercises.length > 0) {
        const insertRelation = `
          INSERT INTO RutinaEjercicio (id_rutina, id_ejercicio, orden)
          VALUES ($1, $2, $3)
        `;
        for (const ejercicio of exercises) {
          await client.query(insertRelation, [idRutina, ejercicio.idEjercicio, ejercicio.orden || null]);
        }
      }

      await client.query('COMMIT');
      return await this.findById(idRutina);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async update(id, data, exercises = null) {
    const { nombreRutina, descripcionRutina, imagenMusculosTrabajados } = data;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const updateQuery = `
        UPDATE Rutina
        SET nombre_rutina = $1, descripcion_rutina = $2, imagen_musculos_trabajados = $3
        WHERE id_rutina = $4
      `;
      await client.query(updateQuery, [nombreRutina, descripcionRutina, imagenMusculosTrabajados, id]);

      if (Array.isArray(exercises)) {
        await client.query('DELETE FROM RutinaEjercicio WHERE id_rutina = $1', [id]);
        const insertRelation = `
          INSERT INTO RutinaEjercicio (id_rutina, id_ejercicio, orden)
          VALUES ($1, $2, $3)
        `;
        for (const ejercicio of exercises) {
          await client.query(insertRelation, [id, ejercicio.idEjercicio, ejercicio.orden || null]);
        }
      }

      await client.query('COMMIT');
      return await this.findById(id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async delete(id) {
    const query = 'DELETE FROM Rutina WHERE id_rutina = $1';
    await pool.query(query, [id]);
  }
}

export default RutinaModel;