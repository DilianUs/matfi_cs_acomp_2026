import pool from '../config/database.js';

class MetaFisicaModel {
  // Obtener meta física del usuario autenticado
  static async findByUserId(idUsuario) {
    const query = `
      SELECT id_meta, id_usuario, tipo_de_meta, calorias_objetivo, fecha_inicio, fecha_fin
      FROM MetaFisica
      WHERE id_usuario = $1
      ORDER BY fecha_inicio DESC
    `;
    const result = await pool.query(query, [idUsuario]);
    return result.rows || [];
  }

  // Obtener una meta física por ID
  static async findById(idMeta) {
    const query = `
      SELECT id_meta, id_usuario, tipo_de_meta, calorias_objetivo, fecha_inicio, fecha_fin
      FROM MetaFisica
      WHERE id_meta = $1
    `;
    const result = await pool.query(query, [idMeta]);
    return result.rows[0] || null;
  }

  // Crear nueva meta física
  static async create(data) {
    const { idUsuario, tipoDeMetaFisica, caloriasObjetivo, fechaInicio, fechaFin } = data;
    const query = `
      INSERT INTO MetaFisica (id_usuario, tipo_de_meta, calorias_objetivo, fecha_inicio, fecha_fin)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id_meta, id_usuario, tipo_de_meta, calorias_objetivo, fecha_inicio, fecha_fin
    `;
    const result = await pool.query(query, [
      idUsuario,
      tipoDeMetaFisica,
      caloriasObjetivo,
      fechaInicio,
      fechaFin,
    ]);
    return result.rows[0];
  }

  // Actualizar meta física
  static async update(idMeta, data) {
    const { tipoDeMetaFisica, caloriasObjetivo, fechaInicio, fechaFin } = data;
    const query = `
      UPDATE MetaFisica
      SET tipo_de_meta = COALESCE($1, tipo_de_meta),
          calorias_objetivo = COALESCE($2, calorias_objetivo),
          fecha_inicio = COALESCE($3, fecha_inicio),
          fecha_fin = COALESCE($4, fecha_fin)
      WHERE id_meta = $5
      RETURNING id_meta, id_usuario, tipo_de_meta, calorias_objetivo, fecha_inicio, fecha_fin
    `;
    const result = await pool.query(query, [
      tipoDeMetaFisica,
      caloriasObjetivo,
      fechaInicio,
      fechaFin,
      idMeta,
    ]);
    return result.rows[0] || null;
  }

  // Eliminar meta física
  static async delete(idMeta) {
    const query = 'DELETE FROM MetaFisica WHERE id_meta = $1';
    await pool.query(query, [idMeta]);
  }

  // Verificar si el usuario es propietario de la meta
  static async isOwner(idMeta, idUsuario) {
    const query = 'SELECT id_usuario FROM MetaFisica WHERE id_meta = $1';
    const result = await pool.query(query, [idMeta]);
    if (!result.rows[0]) return false;
    return result.rows[0].id_usuario === idUsuario;
  }
}

export default MetaFisicaModel;
