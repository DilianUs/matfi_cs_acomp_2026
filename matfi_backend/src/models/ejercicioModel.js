import pool from '../config/database.js';

class EjercicioModel {
  static async findAll() {
    const query = `
      SELECT id_ejercicio, nombre_ejercicio, cantidad_series, cantidad_repeticiones,
             descripcion_ejercicio, video_ejercicio
      FROM Ejercicio
      ORDER BY id_ejercicio
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT id_ejercicio, nombre_ejercicio, cantidad_series, cantidad_repeticiones,
             descripcion_ejercicio, video_ejercicio
      FROM Ejercicio
      WHERE id_ejercicio = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async create(data) {
    const { nombreEjercicio, cantidadSeries, cantidadRepeticiones, descripcionEjercicio, videoEjercicio } = data;
    const query = `
      INSERT INTO Ejercicio (nombre_ejercicio, cantidad_series, cantidad_repeticiones, descripcion_ejercicio, video_ejercicio)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id_ejercicio, nombre_ejercicio, cantidad_series, cantidad_repeticiones, descripcion_ejercicio, video_ejercicio
    `;
    const result = await pool.query(query, [nombreEjercicio, cantidadSeries, cantidadRepeticiones, descripcionEjercicio, videoEjercicio]);
    return result.rows[0];
  }

  static async update(id, data) {
    const { nombreEjercicio, cantidadSeries, cantidadRepeticiones, descripcionEjercicio, videoEjercicio } = data;
    const query = `
      UPDATE Ejercicio
      SET nombre_ejercicio = $1, cantidad_series = $2, cantidad_repeticiones = $3,
          descripcion_ejercicio = $4, video_ejercicio = $5
      WHERE id_ejercicio = $6
      RETURNING id_ejercicio, nombre_ejercicio, cantidad_series, cantidad_repeticiones, descripcion_ejercicio, video_ejercicio
    `;
    const result = await pool.query(query, [nombreEjercicio, cantidadSeries, cantidadRepeticiones, descripcionEjercicio, videoEjercicio, id]);
    return result.rows[0] || null;
  }

  static async delete(id) {
    const query = 'DELETE FROM Ejercicio WHERE id_ejercicio = $1';
    await pool.query(query, [id]);
  }
}

export default EjercicioModel;