import express from 'express';
import RutinaController from '../controllers/rutinaController.js';
import authMiddleware from '../middleware/authMiddleware.js';

/**
 * @swagger
 * tags:
 *   - name: Rutinas
 *     description: Gestión de rutinas
 *
 * /api/rutinas:
 *   get:
 *     summary: Obtener todas las rutinas
 *     tags: [Rutinas]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de rutinas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Rutina'
 *   post:
 *     summary: Crear una rutina
 *     tags: [Rutinas]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombreRutina:
 *                 type: string
 *               descripcionRutina:
 *                 type: string
 *               imagenMusculosTrabajados:
 *                 type: string
 *               ejercicios:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     idEjercicio:
 *                       type: integer
 *                     orden:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Rutina creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rutina'
 *
 * /api/rutinas/{id}:
 *   put:
 *     summary: Actualizar una rutina
 *     tags: [Rutinas]
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
 *               nombreRutina:
 *                 type: string
 *               descripcionRutina:
 *                 type: string
 *               imagenMusculosTrabajados:
 *                 type: string
 *               ejercicios:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     idEjercicio:
 *                       type: integer
 *                     orden:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Rutina actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rutina'
 *       404:
 *         $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Eliminar una rutina
 *     tags: [Rutinas]
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
 *         description: Rutina eliminada correctamente
 *       404:
 *         $ref: '#/components/schemas/Error'
 */

const router = express.Router();
router.use(authMiddleware);

router.get('/', RutinaController.getAll);
router.post('/', RutinaController.create);
router.put('/:id', RutinaController.update);
router.delete('/:id', RutinaController.delete);

export default router;
