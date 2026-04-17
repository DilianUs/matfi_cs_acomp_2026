import express from 'express';
import EjercicioController from '../controllers/ejercicioController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', EjercicioController.getAll);
router.post('/', EjercicioController.create);
router.put('/:id', EjercicioController.update);
router.delete('/:id', EjercicioController.delete);

export default router;