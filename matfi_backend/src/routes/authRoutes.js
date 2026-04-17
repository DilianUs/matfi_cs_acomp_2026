import express from 'express';
import AuthController from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Ruta para registro
router.post('/register', AuthController.register);

// Ruta para login
router.post('/login', AuthController.login);

// Ruta para obtener perfil (requiere autenticación)
router.get('/profile', authMiddleware, AuthController.getProfile);

export default router;