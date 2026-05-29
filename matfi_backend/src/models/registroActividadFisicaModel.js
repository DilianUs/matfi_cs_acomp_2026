import pool from '../config/database.js';

class RegistroActividadFisicaModel {
  // Obtener todos los registros de actividad del usuario
  static async findByUserId(idUsuario) {
    const query = `
      SELECT 
        raf.id_registro_actividad, 
        raf.id_usuario, 
        raf.fecha, 
        raf.calorias_quemadas, 
        raf.tiempo_invertido, 
        raf.nivel_de_intensidad,
        json_agg(
          json_build_object(
            'id_rutina', r.id_rutina,
            'nombre_rutina', r.nombre_rutina,
            'descripcion_rutina', r.descripcion_rutina
          )
        ) FILTER (WHERE r.id_rutina IS NOT NULL) as rutinas
      FROM RegistroActividadFisicaDiaria raf
      LEFT JOIN RegistroActividadRutina rar ON raf.id_registro_actividad = rar.id_registro_actividad
      LEFT JOIN Rutina r ON rar.id_rutina = r.id_rutina
      WHERE raf.id_usuario = $1
      GROUP BY raf.id_registro_actividad
      ORDER BY raf.fecha DESC
    `;
    const result = await pool.query(query, [idUsuario]);
    return result.rows || [];
  }

  // Obtener registros de actividad por fecha
  static async findByUserAndDate(idUsuario, fecha) {
    const query = `
      SELECT 
        raf.id_registro_actividad, 
        raf.id_usuario, 
        raf.fecha, 
        raf.calorias_quemadas, 
        raf.tiempo_invertido, 
        raf.nivel_de_intensidad,
        json_agg(
          json_build_object(
            'id_rutina', r.id_rutina,
            'nombre_rutina', r.nombre_rutina
          )
        ) FILTER (WHERE r.id_rutina IS NOT NULL) as rutinas
      FROM RegistroActividadFisicaDiaria raf
      LEFT JOIN RegistroActividadRutina rar ON raf.id_registro_actividad = rar.id_registro_actividad
      LEFT JOIN Rutina r ON rar.id_rutina = r.id_rutina
      WHERE raf.id_usuario = $1 AND raf.fecha = $2
      GROUP BY raf.id_registro_actividad
    `;
    const result = await pool.query(query, [idUsuario, fecha]);
    return result.rows || [];
  }

  // Obtener un registro por ID
  static async findById(idRegistroActividad) {
    const query = `
      SELECT 
        raf.id_registro_actividad, 
        raf.id_usuario, 
        raf.fecha, 
        raf.calorias_quemadas, 
        raf.tiempo_invertido, 
        raf.nivel_de_intensidad,
        json_agg(
          json_build_object(
            'id_rutina', r.id_rutina,
            'nombre_rutina', r.nombre_rutina
          )
        ) FILTER (WHERE r.id_rutina IS NOT NULL) as rutinas
      FROM RegistroActividadFisicaDiaria raf
      LEFT JOIN RegistroActividadRutina rar ON raf.id_registro_actividad = rar.id_registro_actividad
      LEFT JOIN Rutina r ON rar.id_rutina = r.id_rutina
      WHERE raf.id_registro_actividad = $1
      GROUP BY raf.id_registro_actividad
    `;
    const result = await pool.query(query, [idRegistroActividad]);
    return result.rows[0] || null;
  }

  // Crear nuevo registro de actividad
  static async create(data) {
    const { idUsuario, fecha, caloriasQuemadas, tiempoInvertido, nivelDeIntensidad } = data;
    const query = `
      INSERT INTO RegistroActividadFisicaDiaria (id_usuario, fecha, calorias_quemadas, tiempo_invertido, nivel_de_intensidad)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id_registro_actividad, id_usuario, fecha, calorias_quemadas, tiempo_invertido, nivel_de_intensidad
    `;
    const result = await pool.query(query, [
      idUsuario,
      fecha,
      caloriasQuemadas,
      tiempoInvertido,
      nivelDeIntensidad,
    ]);
    return result.rows[0];
  }

  // Actualizar registro de actividad
  static async update(idRegistroActividad, data) {
    const { caloriasQuemadas, tiempoInvertido, nivelDeIntensidad } = data;
    const query = `
      UPDATE RegistroActividadFisicaDiaria
      SET calorias_quemadas = COALESCE($1, calorias_quemadas),
          tiempo_invertido = COALESCE($2, tiempo_invertido),
          nivel_de_intensidad = COALESCE($3, nivel_de_intensidad)
      WHERE id_registro_actividad = $4
      RETURNING id_registro_actividad, id_usuario, fecha, calorias_quemadas, tiempo_invertido, nivel_de_intensidad
    `;
    const result = await pool.query(query, [
      caloriasQuemadas,
      tiempoInvertido,
      nivelDeIntensidad,
      idRegistroActividad,
    ]);
    return result.rows[0] || null;
  }

  // Eliminar registro de actividad
  static async delete(idRegistroActividad) {
    const query = 'DELETE FROM RegistroActividadFisicaDiaria WHERE id_registro_actividad = $1';
    await pool.query(query, [idRegistroActividad]);
  }

  // Agregar rutina a registro de actividad
  static async addRutina(idRegistroActividad, idRutina) {
    const query = `
      INSERT INTO RegistroActividadRutina (id_registro_actividad, id_rutina)
      VALUES ($1, $2)
      RETURNING id, id_registro_actividad, id_rutina
    `;
    const result = await pool.query(query, [idRegistroActividad, idRutina]);
    return result.rows[0];
  }

  // Eliminar rutina de registro de actividad
  static async removeRutina(idRegistroActividad, idRutina) {
    const query =
      'DELETE FROM RegistroActividadRutina WHERE id_registro_actividad = $1 AND id_rutina = $2';
    await pool.query(query, [idRegistroActividad, idRutina]);
  }

  // Verificar si el usuario es propietario del registro
  static async isOwner(idRegistroActividad, idUsuario) {
    const query =
      'SELECT id_usuario FROM RegistroActividadFisicaDiaria WHERE id_registro_actividad = $1';
    const result = await pool.query(query, [idRegistroActividad]);
    if (!result.rows[0]) return false;
    return result.rows[0].id_usuario === idUsuario;
  }
}

export default RegistroActividadFisicaModel;
