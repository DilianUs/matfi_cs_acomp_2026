import AuthService from '../services/authService.js';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticación requerido' });
  }

  const token = authHeader.substring(7); // Remover 'Bearer '

  try {
    const decoded = AuthService.verifyToken(token);
    req.user = decoded; // Agregar información del usuario a la request
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

export default authMiddleware;