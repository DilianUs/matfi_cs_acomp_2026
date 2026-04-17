import express from 'express';
import RutinaController from '../controllers/rutinaController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', RutinaController.getAll);
router.post('/', RutinaController.create);
router.put('/:id', RutinaController.update);
router.delete('/:id', RutinaController.delete);

export default router;