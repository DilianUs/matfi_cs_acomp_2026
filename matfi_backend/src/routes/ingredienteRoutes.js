import express from 'express';
import IngredienteController from '../controllers/ingredienteController.js';
import authMiddleware from '../middleware/authMiddleware.js';

/**
 * @swagger
 * tags:
 *   - name: Ingredientes
 *     description: Gestión de ingredientes
 *
 * /api/ingredientes:
 *   get:
 *     summary: Obtener todos los ingredientes
 *     tags: [Ingredientes]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de ingredientes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ingrediente'
 *   post:
 *     summary: Crear un ingrediente
 *     tags: [Ingredientes]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombreIngrediente:
 *                 type: string
 *               unidad:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ingrediente creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ingrediente'
 *
 * /api/ingredientes/{id}:
 *   put:
 *     summary: Actualizar un ingrediente
 *     tags: [Ingredientes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombreIngrediente:
 *                 type: string
 *               unidad:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ingrediente actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ingrediente'
 *       404:
 *         $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Eliminar un ingrediente
 *     tags: [Ingredientes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ingrediente eliminado correctamente
 *       404:
 *         $ref: '#/components/schemas/Error'
 */

const router = express.Router();
router.use(authMiddleware);

router.get('/', IngredienteController.getAll);
router.post('/', IngredienteController.create);
router.put('/:id', IngredienteController.update);
router.delete('/:id', IngredienteController.delete);

export default router;
