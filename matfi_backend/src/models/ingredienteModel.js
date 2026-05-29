import pool from '../config/database.js';

class IngredienteModel {
  static async findAll() {
    const query =
      'SELECT id_ingrediente, nombre_ingrediente, unidad FROM Ingrediente ORDER BY id_ingrediente';
    const result = await pool.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query =
      'SELECT id_ingrediente, nombre_ingrediente, unidad FROM Ingrediente WHERE id_ingrediente = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async create({ nombreIngrediente, unidad }) {
    const query =
      'INSERT INTO Ingrediente (nombre_ingrediente, unidad) VALUES ($1, $2) RETURNING id_ingrediente, nombre_ingrediente, unidad';
    const result = await pool.query(query, [nombreIngrediente, unidad]);
    return result.rows[0];
  }

  static async update(id, { nombreIngrediente, unidad }) {
    const query =
      'UPDATE Ingrediente SET nombre_ingrediente = $1, unidad = $2 WHERE id_ingrediente = $3 RETURNING id_ingrediente, nombre_ingrediente, unidad';
    const result = await pool.query(query, [nombreIngrediente, unidad, id]);
    return result.rows[0] || null;
  }

  static async delete(id) {
    const query = 'DELETE FROM Ingrediente WHERE id_ingrediente = $1';
    await pool.query(query, [id]);
  }
}

export default IngredienteModel;
