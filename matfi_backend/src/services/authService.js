import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Debería estar en .env

class AuthService {
  // Generar token JWT
  static generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
  }

  // Verificar token JWT
  static verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Token inválido');
    }
  }
}

export default AuthService;
