import pool from '../config/database.js';

class HistorialIntegralModel {
  // Obtener el historial integral del usuario
  static async findByUserId(idUsuario) {
    const query = `
      SELECT 
        hi.id_historial,
        hi.id_usuario,
        hi.fecha,
        COALESCE(raf.id_registro_actividad, NULL) as id_registro_actividad,
        COALESCE(raf.calorias_quemadas, 0) as calorias_quemadas,
        COALESCE(raf.tiempo_invertido, 0) as tiempo_invertido,
        COALESCE(raf.nivel_de_intensidad, NULL) as nivel_de_intensidad,
        json_agg(
          DISTINCT json_build_object(
            'id_rutina', r.id_rutina,
            'nombre_rutina', r.nombre_rutina
          )
        ) FILTER (WHERE r.id_rutina IS NOT NULL) as rutinas,
        COALESCE(ria.id_registro_ingesta, NULL) as id_registro_ingesta,
        COALESCE(ria.calorias_totales_consumidas, 0) as calorias_totales_consumidas,
        json_agg(
          DISTINCT json_build_object(
            'id_receta', re.id_receta,
            'nombre_receta', re.nombre_receta,
            'calorias_aproximadas', re.calorias_aproximadas
          )
        ) FILTER (WHERE re.id_receta IS NOT NULL) as recetas
      FROM HistorialIntegral hi
      LEFT JOIN RegistroActividadFisicaDiaria raf ON hi.id_registro_actividad = raf.id_registro_actividad
      LEFT JOIN RegistroActividadRutina rar ON raf.id_registro_actividad = rar.id_registro_actividad
      LEFT JOIN Rutina r ON rar.id_rutina = r.id_rutina
      LEFT JOIN RegistroIngestaAlimenticiaDiaria ria ON hi.id_registro_ingesta = ria.id_registro_ingesta
      LEFT JOIN RegistroIngestaReceta rir ON ria.id_registro_ingesta = rir.id_registro_ingesta
      LEFT JOIN Receta re ON rir.id_receta = re.id_receta
      WHERE hi.id_usuario = $1
      GROUP BY hi.id_historial, raf.id_registro_actividad, ria.id_registro_ingesta
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
        COALESCE(raf.id_registro_actividad, NULL) as id_registro_actividad,
        COALESCE(raf.calorias_quemadas, 0) as calorias_quemadas,
        COALESCE(raf.tiempo_invertido, 0) as tiempo_invertido,
        COALESCE(raf.nivel_de_intensidad, NULL) as nivel_de_intensidad,
        json_agg(
          DISTINCT json_build_object(
            'id_rutina', r.id_rutina,
            'nombre_rutina', r.nombre_rutina
          )
        ) FILTER (WHERE r.id_rutina IS NOT NULL) as rutinas,
        COALESCE(ria.id_registro_ingesta, NULL) as id_registro_ingesta,
        COALESCE(ria.calorias_totales_consumidas, 0) as calorias_totales_consumidas,
        json_agg(
          DISTINCT json_build_object(
            'id_receta', re.id_receta,
            'nombre_receta', re.nombre_receta,
            'calorias_aproximadas', re.calorias_aproximadas
          )
        ) FILTER (WHERE re.id_receta IS NOT NULL) as recetas
      FROM HistorialIntegral hi
      LEFT JOIN RegistroActividadFisicaDiaria raf ON hi.id_registro_actividad = raf.id_registro_actividad
      LEFT JOIN RegistroActividadRutina rar ON raf.id_registro_actividad = rar.id_registro_actividad
      LEFT JOIN Rutina r ON rar.id_rutina = r.id_rutina
      LEFT JOIN RegistroIngestaAlimenticiaDiaria ria ON hi.id_registro_ingesta = ria.id_registro_ingesta
      LEFT JOIN RegistroIngestaReceta rir ON ria.id_registro_ingesta = rir.id_registro_ingesta
      LEFT JOIN Receta re ON rir.id_receta = re.id_receta
      WHERE hi.id_usuario = $1 AND hi.fecha BETWEEN $2 AND $3
      GROUP BY hi.id_historial, raf.id_registro_actividad, ria.id_registro_ingesta
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
    const result = await pool.query(query, [idUsuario, fecha, idRegistroActividad, idRegistroIngesta]);
    return result.rows[0];
  }

  // Obtener estadísticas consolidadas del usuario
  static async getEstadisticas(idUsuario, fechaInicio = null, fechaFin = null) {
    let whereClause = 'raf.id_usuario = $1';
    const params = [idUsuario];
    let paramIndex = 2;

    if (fechaInicio && fechaFin) {
      whereClause += ` AND raf.fecha BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
      params.push(fechaInicio, fechaFin);
    }

    const query = `
      SELECT 
        COUNT(DISTINCT raf.id_registro_actividad) as total_registros_actividad,
        COALESCE(SUM(raf.calorias_quemadas), 0) as calorias_quemadas_total,
        COALESCE(SUM(raf.tiempo_invertido), 0) as tiempo_invertido_total,
        COALESCE(AVG(raf.calorias_quemadas), 0) as calorias_quemadas_promedio,
        COALESCE(AVG(raf.tiempo_invertido), 0) as tiempo_invertido_promedio,
        COUNT(DISTINCT ria.id_registro_ingesta) as total_registros_ingesta,
        COALESCE(SUM(ria.calorias_totales_consumidas), 0) as calorias_consumidas_total,
        COALESCE(AVG(ria.calorias_totales_consumidas), 0) as calorias_consumidas_promedio,
        COUNT(DISTINCT rar.id_rutina) as total_rutinas_diferentes,
        COUNT(DISTINCT rir.id_receta) as total_recetas_diferentes
      FROM RegistroActividadFisicaDiaria raf
      FULL OUTER JOIN RegistroActividadRutina rar ON raf.id_registro_actividad = rar.id_registro_actividad
      FULL OUTER JOIN RegistroIngestaAlimenticiaDiaria ria ON raf.id_usuario = ria.id_usuario
      LEFT JOIN RegistroIngestaReceta rir ON ria.id_registro_ingesta = rir.id_registro_ingesta
      WHERE ${whereClause}
    `;
    const result = await pool.query(query, params);
    return result.rows[0] || null;
  }
}

export default HistorialIntegralModel;
