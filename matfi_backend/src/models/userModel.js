import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

class UserModel {
  // Buscar usuario por correo
  static async findByEmail(correo) {
    try {
      const query = `
        SELECT cu.id_cuenta, cu.correo_usuario, cu.contrasenia_usuario,
               u.id_usuario, u.nombre_usuario, u.edad_usuario, u.genero_usuario,
               u.estatura_usuario, u.peso_usuario
        FROM CuentaDeUsuario cu
        JOIN Usuario u ON cu.id_usuario = u.id_usuario
        WHERE cu.correo_usuario = $1
      `;
      const result = await pool.query(query, [correo]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error('Error al buscar usuario por correo');
    }
  }

  // Crear nuevo usuario
  static async create(userData) {
    const {
      nombreUsuario,
      edadUsuario,
      generoUsuario,
      estaturaUsuario,
      pesoUsuario,
      correoUsuario,
      contraseniaUsuario,
    } = userData;

    try {
      // Iniciar transacción
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Insertar en Usuario
        const userQuery = `
          INSERT INTO Usuario (nombre_usuario, edad_usuario, genero_usuario, estatura_usuario, peso_usuario)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id_usuario
        `;
        const userResult = await client.query(userQuery, [
          nombreUsuario,
          edadUsuario,
          generoUsuario,
          estaturaUsuario,
          pesoUsuario,
        ]);
        const idUsuario = userResult.rows[0].id_usuario;

        // Encriptar contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(contraseniaUsuario, saltRounds);

        // Insertar en CuentaDeUsuario
        const accountQuery = `
          INSERT INTO CuentaDeUsuario (correo_usuario, contrasenia_usuario, id_usuario)
          VALUES ($1, $2, $3)
          RETURNING id_cuenta
        `;
        const accountResult = await client.query(accountQuery, [
          correoUsuario,
          hashedPassword,
          idUsuario,
        ]);

        await client.query('COMMIT');

        return {
          idCuenta: accountResult.rows[0].id_cuenta,
          idUsuario,
          nombreUsuario,
          correoUsuario,
        };
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      throw new Error('Error al crear usuario');
    }
  }

  // Verificar contraseña
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Actualizar perfil de usuario
  static async updateProfile(idUsuario, userData) {
    const { nombreUsuario, edadUsuario, generoUsuario, estaturaUsuario, pesoUsuario } = userData;
    try {
      const query = `
        UPDATE Usuario
        SET nombre_usuario = COALESCE($1, nombre_usuario),
            edad_usuario = COALESCE($2, edad_usuario),
            genero_usuario = COALESCE($3, genero_usuario),
            estatura_usuario = COALESCE($4, estatura_usuario),
            peso_usuario = COALESCE($5, peso_usuario)
        WHERE id_usuario = $6
        RETURNING id_usuario, nombre_usuario, edad_usuario, genero_usuario, estatura_usuario, peso_usuario
      `;
      const result = await pool.query(query, [
        nombreUsuario,
        edadUsuario,
        generoUsuario,
        estaturaUsuario,
        pesoUsuario,
        idUsuario,
      ]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error('Error al actualizar perfil de usuario');
    }
  }
}

export default UserModel;
