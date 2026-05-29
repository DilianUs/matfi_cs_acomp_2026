import express from 'express';
import RecetaController from '../controllers/recetaController.js';
import authMiddleware from '../middleware/authMiddleware.js';

/**
 * @swagger
 * tags:
 *   - name: Recetas
 *     description: Gestión de recetas
 *
 * /api/recetas:
 *   get:
 *     summary: Obtener todas las recetas
 *     tags: [Recetas]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de recetas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Receta'
 *   post:
 *     summary: Crear una receta
 *     tags: [Recetas]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombreReceta:
 *                 type: string
 *               imagenAlusiva:
 *                 type: string
 *               descripcionGeneral:
 *                 type: string
 *               pasosPreparacion:
 *                 type: array
 *                 items:
 *                   type: string
 *               caloriasAproximadas:
 *                 type: number
 *               ingredientes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     idIngrediente:
 *                       type: integer
 *                     cantidad:
 *                       type: number
 *     responses:
 *       201:
 *         description: Receta creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Receta'
 *
 * /api/recetas/{id}:
 *   get:
 *     summary: Obtener una receta por id
 *     tags: [Recetas]
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
 *         description: Receta encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Receta'
 *       404:
 *         $ref: '#/components/schemas/Error'
 *   put:
 *     summary: Actualizar una receta
 *     tags: [Recetas]
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
 *               nombreReceta:
 *                 type: string
 *               imagenAlusiva:
 *                 type: string
 *               descripcionGeneral:
 *                 type: string
 *               pasosPreparacion:
 *                 type: array
 *                 items:
 *                   type: string
 *               caloriasAproximadas:
 *                 type: number
 *               ingredientes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     idIngrediente:
 *                       type: integer
 *                     cantidad:
 *                       type: number
 *     responses:
 *       200:
 *         description: Receta actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Receta'
 *       404:
 *         $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Eliminar una receta
 *     tags: [Recetas]
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
 *         description: Receta eliminada correctamente
 *       404:
 *         $ref: '#/components/schemas/Error'
 */

const router = express.Router();
router.use(authMiddleware);

router.get('/', RecetaController.getAll);
router.post('/', RecetaController.create);
router.put('/:id', RecetaController.update);
router.delete('/:id', RecetaController.delete);

export default router;
