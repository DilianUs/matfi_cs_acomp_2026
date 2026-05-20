import express from 'express';
import RegistroActividadFisicaController from '../controllers/registroActividadFisicaController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

/**
 * @swagger
 * /api/registrosActividad:
 *   get:
 *     summary: Obtener todos los registros de actividad del usuario
 *     tags: [Registro Actividad Física]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de registros de actividad
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RegistroActividadFisica'
 *       401:
 *         description: Token no válido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', RegistroActividadFisicaController.getAll);

/**
 * @swagger
 * /api/registrosActividad/byDate:
 *   get:
 *     summary: Obtener registros de actividad por fecha
 *     tags: [Registro Actividad Física]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fecha
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: 2026-05-20
 *     responses:
 *       200:
 *         description: Registros de la fecha especificada
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RegistroActividadFisica'
 *       400:
 *         description: Fecha inválida
 *       401:
 *         description: Token no válido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/byDate', RegistroActividadFisicaController.getByDate);

/**
 * @swagger
 * /api/registrosActividad:
 *   post:
 *     summary: Crear nuevo registro de actividad física
 *     tags: [Registro Actividad Física]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fecha
 *               - caloriasQuemadas
 *             properties:
 *               fecha:
 *                 type: string
 *                 format: date
 *                 example: 2026-05-20
 *               caloriasQuemadas:
 *                 type: integer
 *                 example: 500
 *               tiempoInvertido:
 *                 type: number
 *                 example: 60.5
 *               nivelDeIntensidad:
 *                 type: string
 *                 enum: [baja, media, alta]
 *                 example: alta
 *     responses:
 *       201:
 *         description: Registro creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 registro:
 *                   $ref: '#/components/schemas/RegistroActividadFisica'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token no válido
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', RegistroActividadFisicaController.create);

/**
 * @swagger
 * /api/registrosActividad/{id}:
 *   put:
 *     summary: Actualizar registro de actividad física
 *     tags: [Registro Actividad Física]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               caloriasQuemadas:
 *                 type: integer
 *               tiempoInvertido:
 *                 type: number
 *               nivelDeIntensidad:
 *                 type: string
 *                 enum: [baja, media, alta]
 *     responses:
 *       200:
 *         description: Registro actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: Sin permiso para actualizar
 *       404:
 *         description: Registro no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', RegistroActividadFisicaController.update);

/**
 * @swagger
 * /api/registrosActividad/{id}:
 *   delete:
 *     summary: Eliminar registro de actividad física
 *     tags: [Registro Actividad Física]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Registro eliminado correctamente
 *       403:
 *         description: Sin permiso para eliminar
 *       404:
 *         description: Registro no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', RegistroActividadFisicaController.delete);

/**
 * @swagger
 * /api/registrosActividad/{id}/rutinas:
 *   post:
 *     summary: Agregar rutina a registro de actividad
 *     tags: [Registro Actividad Física]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idRutina
 *             properties:
 *               idRutina:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Rutina agregada exitosamente
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: Sin permiso
 *       404:
 *         description: Registro no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/:id/rutinas', RegistroActividadFisicaController.addRutina);

/**
 * @swagger
 * /api/registrosActividad/{id}/rutinas/{idRutina}:
 *   delete:
 *     summary: Eliminar rutina de registro de actividad
 *     tags: [Registro Actividad Física]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: path
 *         name: idRutina
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Rutina eliminada correctamente
 *       403:
 *         description: Sin permiso
 *       404:
 *         description: Registro no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id/rutinas/:idRutina', RegistroActividadFisicaController.removeRutina);

export default router;
