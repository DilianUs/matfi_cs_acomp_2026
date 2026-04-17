import express from 'express';
import IngredienteController from '../controllers/ingredienteController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', IngredienteController.getAll);
router.post('/', IngredienteController.create);
router.put('/:id', IngredienteController.update);
router.delete('/:id', IngredienteController.delete);

export default router;