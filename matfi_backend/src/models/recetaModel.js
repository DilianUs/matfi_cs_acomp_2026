import pool from '../config/database.js';

class RecetaModel {
  static async findAll() {
    const query = `
      SELECT r.id_receta, r.nombre_receta, r.imagen_alusiva, r.descripcion_general,
             r.pasos_preparacion, r.calorias_aproximadas,
             COALESCE(jsonb_agg(jsonb_build_object(
               'idIngrediente', i.id_ingrediente,
               'nombreIngrediente', i.nombre_ingrediente,
               'unidad', i.unidad,
               'cantidad', ri.cantidad
             ) ORDER BY i.nombre_ingrediente) FILTER (WHERE i.id_ingrediente IS NOT NULL), '[]') as ingredientes
      FROM Receta r
      LEFT JOIN RecetaIngrediente ri ON ri.id_receta = r.id_receta
      LEFT JOIN Ingrediente i ON i.id_ingrediente = ri.id_ingrediente
      GROUP BY r.id_receta
      ORDER BY r.id_receta;
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT r.id_receta, r.nombre_receta, r.imagen_alusiva, r.descripcion_general,
             r.pasos_preparacion, r.calorias_aproximadas,
             COALESCE(jsonb_agg(jsonb_build_object(
               'idIngrediente', i.id_ingrediente,
               'nombreIngrediente', i.nombre_ingrediente,
               'unidad', i.unidad,
               'cantidad', ri.cantidad
             ) ORDER BY i.nombre_ingrediente) FILTER (WHERE i.id_ingrediente IS NOT NULL), '[]') as ingredientes
      FROM Receta r
      LEFT JOIN RecetaIngrediente ri ON ri.id_receta = r.id_receta
      LEFT JOIN Ingrediente i ON i.id_ingrediente = ri.id_ingrediente
      WHERE r.id_receta = $1
      GROUP BY r.id_receta;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async create(data, ingredients = []) {
    const { nombreReceta, imagenAlusiva, descripcionGeneral, pasosPreparacion, caloriasAproximadas } = data;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const query = `
        INSERT INTO Receta (nombre_receta, imagen_alusiva, descripcion_general, pasos_preparacion, calorias_aproximadas)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id_receta
      `;
      const result = await client.query(query, [nombreReceta, imagenAlusiva, descripcionGeneral, pasosPreparacion, caloriasAproximadas]);
      const idReceta = result.rows[0].id_receta;

      if (Array.isArray(ingredients) && ingredients.length > 0) {
        const insertRelation = `
          INSERT INTO RecetaIngrediente (id_receta, id_ingrediente, cantidad)
          VALUES ($1, $2, $3)
        `;

        for (const ingrediente of ingredients) {
          await client.query(insertRelation, [idReceta, ingrediente.idIngrediente, ingrediente.cantidad]);
        }
      }

      await client.query('COMMIT');
      return await this.findById(idReceta);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async update(id, data, ingredients = null) {
    const { nombreReceta, imagenAlusiva, descripcionGeneral, pasosPreparacion, caloriasAproximadas } = data;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const updateQuery = `
        UPDATE Receta
        SET nombre_receta = $1, imagen_alusiva = $2, descripcion_general = $3,
            pasos_preparacion = $4, calorias_aproximadas = $5
        WHERE id_receta = $6
      `;
      await client.query(updateQuery, [nombreReceta, imagenAlusiva, descripcionGeneral, pasosPreparacion, caloriasAproximadas, id]);

      if (Array.isArray(ingredients)) {
        await client.query('DELETE FROM RecetaIngrediente WHERE id_receta = $1', [id]);
        const insertRelation = `
          INSERT INTO RecetaIngrediente (id_receta, id_ingrediente, cantidad)
          VALUES ($1, $2, $3)
        `;
        for (const ingrediente of ingredients) {
          await client.query(insertRelation, [id, ingrediente.idIngrediente, ingrediente.cantidad]);
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
    const query = 'DELETE FROM Receta WHERE id_receta = $1';
    await pool.query(query, [id]);
  }
}

export default RecetaModel;