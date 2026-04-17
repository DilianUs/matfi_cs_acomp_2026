import express from 'express';
import RecetaController from '../controllers/recetaController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', RecetaController.getAll);
router.post('/', RecetaController.create);
router.put('/:id', RecetaController.update);
router.delete('/:id', RecetaController.delete);

export default router;