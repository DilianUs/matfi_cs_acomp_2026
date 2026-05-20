import pool from '../config/database.js';

class RegistroIngestaAlimenticiModel {
  // Obtener todos los registros de ingesta del usuario
  static async findByUserId(idUsuario) {
    const query = `
      SELECT 
        ria.id_registro_ingesta, 
        ria.id_usuario, 
        ria.fecha, 
        ria.calorias_totales_consumidas,
        json_agg(
          json_build_object(
            'id_receta', r.id_receta,
            'nombre_receta', r.nombre_receta,
            'calorias_aproximadas', r.calorias_aproximadas
          )
        ) FILTER (WHERE r.id_receta IS NOT NULL) as recetas
      FROM RegistroIngestaAlimenticiaDiaria ria
      LEFT JOIN RegistroIngestaReceta rir ON ria.id_registro_ingesta = rir.id_registro_ingesta
      LEFT JOIN Receta r ON rir.id_receta = r.id_receta
      WHERE ria.id_usuario = $1
      GROUP BY ria.id_registro_ingesta
      ORDER BY ria.fecha DESC
    `;
    const result = await pool.query(query, [idUsuario]);
    return result.rows || [];
  }

  // Obtener registros de ingesta por fecha
  static async findByUserAndDate(idUsuario, fecha) {
    const query = `
      SELECT 
        ria.id_registro_ingesta, 
        ria.id_usuario, 
        ria.fecha, 
        ria.calorias_totales_consumidas,
        json_agg(
          json_build_object(
            'id_receta', r.id_receta,
            'nombre_receta', r.nombre_receta,
            'calorias_aproximadas', r.calorias_aproximadas
          )
        ) FILTER (WHERE r.id_receta IS NOT NULL) as recetas
      FROM RegistroIngestaAlimenticiaDiaria ria
      LEFT JOIN RegistroIngestaReceta rir ON ria.id_registro_ingesta = rir.id_registro_ingesta
      LEFT JOIN Receta r ON rir.id_receta = r.id_receta
      WHERE ria.id_usuario = $1 AND ria.fecha = $2
      GROUP BY ria.id_registro_ingesta
    `;
    const result = await pool.query(query, [idUsuario, fecha]);
    return result.rows || [];
  }

  // Obtener un registro por ID
  static async findById(idRegistroIngesta) {
    const query = `
      SELECT 
        ria.id_registro_ingesta, 
        ria.id_usuario, 
        ria.fecha, 
        ria.calorias_totales_consumidas,
        json_agg(
          json_build_object(
            'id_receta', r.id_receta,
            'nombre_receta', r.nombre_receta,
            'calorias_aproximadas', r.calorias_aproximadas
          )
        ) FILTER (WHERE r.id_receta IS NOT NULL) as recetas
      FROM RegistroIngestaAlimenticiaDiaria ria
      LEFT JOIN RegistroIngestaReceta rir ON ria.id_registro_ingesta = rir.id_registro_ingesta
      LEFT JOIN Receta r ON rir.id_receta = r.id_receta
      WHERE ria.id_registro_ingesta = $1
      GROUP BY ria.id_registro_ingesta
    `;
    const result = await pool.query(query, [idRegistroIngesta]);
    return result.rows[0] || null;
  }

  // Crear nuevo registro de ingesta
  static async create(data) {
    const { idUsuario, fecha, caloriasConsumidas } = data;
    const query = `
      INSERT INTO RegistroIngestaAlimenticiaDiaria (id_usuario, fecha, calorias_totales_consumidas)
      VALUES ($1, $2, $3)
      RETURNING id_registro_ingesta, id_usuario, fecha, calorias_totales_consumidas
    `;
    const result = await pool.query(query, [idUsuario, fecha, caloriasConsumidas]);
    return result.rows[0];
  }

  // Actualizar registro de ingesta
  static async update(idRegistroIngesta, data) {
    const { caloriasConsumidas } = data;
    const query = `
      UPDATE RegistroIngestaAlimenticiaDiaria
      SET calorias_totales_consumidas = COALESCE($1, calorias_totales_consumidas)
      WHERE id_registro_ingesta = $2
      RETURNING id_registro_ingesta, id_usuario, fecha, calorias_totales_consumidas
    `;
    const result = await pool.query(query, [caloriasConsumidas, idRegistroIngesta]);
    return result.rows[0] || null;
  }

  // Eliminar registro de ingesta
  static async delete(idRegistroIngesta) {
    const query = 'DELETE FROM RegistroIngestaAlimenticiaDiaria WHERE id_registro_ingesta = $1';
    await pool.query(query, [idRegistroIngesta]);
  }

  // Agregar receta a registro de ingesta
  static async addReceta(idRegistroIngesta, idReceta) {
    const query = `
      INSERT INTO RegistroIngestaReceta (id_registro_ingesta, id_receta)
      VALUES ($1, $2)
      RETURNING id, id_registro_ingesta, id_receta
    `;
    const result = await pool.query(query, [idRegistroIngesta, idReceta]);
    return result.rows[0];
  }

  // Eliminar receta de registro de ingesta
  static async removeReceta(idRegistroIngesta, idReceta) {
    const query = 'DELETE FROM RegistroIngestaReceta WHERE id_registro_ingesta = $1 AND id_receta = $2';
    await pool.query(query, [idRegistroIngesta, idReceta]);
  }

  // Verificar si el usuario es propietario del registro
  static async isOwner(idRegistroIngesta, idUsuario) {
    const query = 'SELECT id_usuario FROM RegistroIngestaAlimenticiaDiaria WHERE id_registro_ingesta = $1';
    const result = await pool.query(query, [idRegistroIngesta]);
    if (!result.rows[0]) return false;
    return result.rows[0].id_usuario === idUsuario;
  }
}

export default RegistroIngestaAlimenticiModel;
