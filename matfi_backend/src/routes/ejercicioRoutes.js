import express from 'express';
import EjercicioController from '../controllers/ejercicioController.js';
import authMiddleware from '../middleware/authMiddleware.js';

/**
 * @swagger
 * tags:
 *   - name: Ejercicios
 *     description: Gestión de ejercicios
 *
 * /api/ejercicios:
 *   get:
 *     summary: Obtener todos los ejercicios
 *     tags: [Ejercicios]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de ejercicios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ejercicio'
 *   post:
 *     summary: Crear un ejercicio
 *     tags: [Ejercicios]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombreEjercicio:
 *                 type: string
 *               cantidadSeries:
 *                 type: integer
 *               cantidadRepeticiones:
 *                 type: integer
 *               descripcionEjercicio:
 *                 type: string
 *               videoEjercicio:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ejercicio creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ejercicio'
 *
 * /api/ejercicios/{id}:
 *   put:
 *     summary: Actualizar un ejercicio
 *     tags: [Ejercicios]
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
 *               nombreEjercicio:
 *                 type: string
 *               cantidadSeries:
 *                 type: integer
 *               cantidadRepeticiones:
 *                 type: integer
 *               descripcionEjercicio:
 *                 type: string
 *               videoEjercicio:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ejercicio actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ejercicio'
 *       404:
 *         $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Eliminar un ejercicio
 *     tags: [Ejercicios]
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
 *         description: Ejercicio eliminado correctamente
 *       404:
 *         $ref: '#/components/schemas/Error'
 */

const router = express.Router();
router.use(authMiddleware);

router.get('/', EjercicioController.getAll);
router.post('/', EjercicioController.create);
router.put('/:id', EjercicioController.update);
router.delete('/:id', EjercicioController.delete);

export default router;