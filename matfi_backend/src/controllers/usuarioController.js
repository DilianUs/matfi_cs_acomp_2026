const pool = require('../../db'); // Importamos la conexión que ya tienes en la raíz
const bcrypt = require('bcryptjs');

const crearUsuario = async (req, res) => {
  const { nombre, telefono, email, contraseña } = req.body;

  try {
    // 1. Verificar si el usuario ya existe
    const usuarioExistente = await pool.query('SELECT * FROM usuario WHERE email = $1', [email]);
    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
    }

    // 2. Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashContraseña = await bcrypt.hash(contraseña, salt);

    // 3. Insertar en la base de datos
    const nuevoUsuario = await pool.query(
      'INSERT INTO usuario (nombre, telefono, email, contraseña) VALUES ($1, $2, $3, $4) RETURNING id_usuario, nombre, email, fecha_registro',
      [nombre, telefono, email, hashContraseña]
    );

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      usuario: nuevoUsuario.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await pool.query('SELECT id_usuario, nombre, email, fecha_registro FROM usuario');
    res.json(usuarios.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

module.exports = {
  crearUsuario,
  obtenerUsuarios
};
