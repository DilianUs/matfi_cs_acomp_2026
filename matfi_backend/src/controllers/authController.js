import UserModel from '../models/userModel.js';
import AuthService from '../services/authService.js';
import ValidationUtils from '../utils/validation.js';

class AuthController {
  // Registro de usuario
  static async register(req, res) {
    try {
      const { nombreUsuario, edadUsuario, generoUsuario, estaturaUsuario, pesoUsuario, correoUsuario, contraseniaUsuario } = req.body;

      // Validación
      if (!ValidationUtils.isNotEmpty(nombreUsuario) || !ValidationUtils.isValidEmail(correoUsuario) || !ValidationUtils.isValidPassword(contraseniaUsuario)) {
        return res.status(400).json({ error: 'Datos inválidos. Verifique nombre, correo y contraseña' });
      }

      if (edadUsuario && !ValidationUtils.isPositiveNumber(edadUsuario)) {
        return res.status(400).json({ error: 'Edad debe ser un número positivo' });
      }

      if (estaturaUsuario && !ValidationUtils.isPositiveNumber(estaturaUsuario)) {
        return res.status(400).json({ error: 'Estatura debe ser un número positivo' });
      }

      if (pesoUsuario && !ValidationUtils.isPositiveNumber(pesoUsuario)) {
        return res.status(400).json({ error: 'Peso debe ser un número positivo' });
      }

      // Verificar si el usuario ya existe
      const existingUser = await UserModel.findByEmail(correoUsuario);
      if (existingUser) {
        return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
      }

      // Crear usuario
      const newUser = await UserModel.create({
        nombreUsuario,
        edadUsuario,
        generoUsuario,
        estaturaUsuario,
        pesoUsuario,
        correoUsuario,
        contraseniaUsuario
      });

      // Generar token
      const token = AuthService.generateToken({
        idUsuario: newUser.idUsuario,
        idCuenta: newUser.idCuenta,
        correo: newUser.correoUsuario
      });

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: {
          idUsuario: newUser.idUsuario,
          nombreUsuario: newUser.nombreUsuario,
          correoUsuario: newUser.correoUsuario
        },
        token
      });
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Inicio de sesión
  static async login(req, res) {
    try {
      const { correoUsuario, contraseniaUsuario } = req.body;

      // Validación
      if (!ValidationUtils.isValidEmail(correoUsuario) || !ValidationUtils.isValidPassword(contraseniaUsuario)) {
        return res.status(400).json({ error: 'Correo o contraseña inválidos' });
      }

      // Buscar usuario
      const user = await UserModel.findByEmail(correoUsuario);
      if (!user) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // Verificar contraseña
      const isPasswordValid = await UserModel.verifyPassword(contraseniaUsuario, user.contrasenia_usuario);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // Generar token
      const token = AuthService.generateToken({
        idUsuario: user.id_usuario,
        idCuenta: user.id_cuenta,
        correo: user.correo_usuario
      });

      res.json({
        message: 'Inicio de sesión exitoso',
        user: {
          idUsuario: user.id_usuario,
          nombreUsuario: user.nombre_usuario,
          correoUsuario: user.correo_usuario
        },
        token
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Obtener perfil del usuario autenticado
  static async getProfile(req, res) {
    try {
      const user = await UserModel.findByEmail(req.user.correo);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json({
        idUsuario: user.id_usuario,
        nombreUsuario: user.nombre_usuario,
        edadUsuario: user.edad_usuario,
        generoUsuario: user.genero_usuario,
        estaturaUsuario: user.estatura_usuario,
        pesoUsuario: user.peso_usuario,
        correoUsuario: user.correo_usuario
      });
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

export default AuthController;