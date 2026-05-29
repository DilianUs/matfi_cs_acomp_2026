import pool from '../config/database.js';

class HistorialIntegralModel {
  // Obtener el historial integral del usuario (versión simplificada sin joins complejos)
  static async findByUserId(idUsuario) {
    const query = `
      SELECT 
        hi.id_historial,
        hi.id_usuario,
        hi.fecha,
        hi.id_registro_actividad,
        hi.id_registro_ingesta
      FROM HistorialIntegral hi
      WHERE hi.id_usuario = $1
      ORDER BY hi.fecha DESC
    `;
    const result = await pool.query(query, [idUsuario]);
    return result.rows || [];
  }

  // Obtener historial por rango de fechas
  static async findByUserAndDateRange(idUsuario, fechaInicio, fechaFin) {
    const query = `
      SELECT 
        hi.id_historial,
        hi.id_usuario,
        hi.fecha,
        hi.id_registro_actividad,
        hi.id_registro_ingesta
      FROM HistorialIntegral hi
      WHERE hi.id_usuario = $1 AND hi.fecha BETWEEN $2 AND $3
      ORDER BY hi.fecha DESC
    `;
    const result = await pool.query(query, [idUsuario, fechaInicio, fechaFin]);
    return result.rows || [];
  }

  // Crear historial integral
  static async create(data) {
    const { idUsuario, fecha, idRegistroActividad, idRegistroIngesta } = data;
    const query = `
      INSERT INTO HistorialIntegral (id_usuario, fecha, id_registro_actividad, id_registro_ingesta)
      VALUES ($1, $2, $3, $4)
      RETURNING id_historial, id_usuario, fecha, id_registro_actividad, id_registro_ingesta
    `;
    const result = await pool.query(query, [
      idUsuario,
      fecha,
      idRegistroActividad,
      idRegistroIngesta,
    ]);
    return result.rows[0];
  }

  // Obtener estadísticas consolidadas del usuario
  static async getEstadisticas(idUsuario, fechaInicio = null, fechaFin = null) {
    const params = [idUsuario];

    let queryAct = `
      SELECT 
        COUNT(DISTINCT raf.id_registro_actividad) as total_registros_actividad,
        COALESCE(SUM(raf.calorias_quemadas), 0) as calorias_quemadas_total,
        COALESCE(SUM(raf.tiempo_invertido), 0) as tiempo_invertido_total,
        COALESCE(AVG(raf.calorias_quemadas), 0) as calorias_quemadas_promedio,
        COALESCE(AVG(raf.tiempo_invertido), 0) as tiempo_invertido_promedio,
        COUNT(DISTINCT rar.id_rutina) as total_rutinas_diferentes
      FROM RegistroActividadFisicaDiaria raf
      LEFT JOIN RegistroActividadRutina rar ON raf.id_registro_actividad = rar.id_registro_actividad
      WHERE raf.id_usuario = $1`;

    let queryIng = `
      SELECT 
        COUNT(DISTINCT ria.id_registro_ingesta) as total_registros_ingesta,
        COALESCE(SUM(ria.calorias_totales_consumidas), 0) as calorias_consumidas_total,
        COALESCE(AVG(ria.calorias_totales_consumidas), 0) as calorias_consumidas_promedio,
        COUNT(DISTINCT rir.id_receta) as total_recetas_diferentes
      FROM RegistroIngestaAlimenticiaDiaria ria
      LEFT JOIN RegistroIngestaReceta rir ON ria.id_registro_ingesta = rir.id_registro_ingesta
      WHERE ria.id_usuario = $1`;

    if (fechaInicio && fechaFin) {
      queryAct += ` AND raf.fecha BETWEEN $2 AND $3`;
      queryIng += ` AND ria.fecha BETWEEN $2 AND $3`;
      params.push(fechaInicio, fechaFin);
    }

    const query = `
      WITH stats_actividad AS (${queryAct}),
           stats_ingesta AS (${queryIng})
      SELECT * FROM stats_actividad, stats_ingesta
    `;
    const result = await pool.query(query, params);
    return result.rows[0] || null;
  }
}

export default HistorialIntegralModel;
