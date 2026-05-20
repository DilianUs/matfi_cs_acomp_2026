import express from 'express';
import EstadisticasController from '../controllers/estadisticasController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

/**
 * @swagger
 * /api/estadisticas/historial:
 *   get:
 *     summary: Obtener historial integral completo del usuario
 *     tags: [Estadísticas]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Historial completo del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/HistorialIntegral'
 *       401:
 *         description: Token no válido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/historial', EstadisticasController.getHistorial);

/**
 * @swagger
 * /api/estadisticas/historial/rango:
 *   get:
 *     summary: Obtener historial integral por rango de fechas
 *     tags: [Estadísticas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fechaInicio
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: 2026-05-01
 *       - in: query
 *         name: fechaFin
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: 2026-05-31
 *     responses:
 *       200:
 *         description: Historial del rango de fechas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/HistorialIntegral'
 *       400:
 *         description: Fechas inválidas
 *       401:
 *         description: Token no válido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/historial/rango', EstadisticasController.getHistorialByDateRange);

/**
 * @swagger
 * /api/estadisticas/consolidadas:
 *   get:
 *     summary: Obtener estadísticas consolidadas del usuario
 *     tags: [Estadísticas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fechaInicio
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         example: 2026-05-01
 *       - in: query
 *         name: fechaFin
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         example: 2026-05-31
 *     responses:
 *       200:
 *         description: Estadísticas consolidadas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Estadisticas'
 *       400:
 *         description: Fechas inválidas
 *       401:
 *         description: Token no válido
 *       404:
 *         description: No hay datos disponibles
 *       500:
 *         description: Error interno del servidor
 */
router.get('/consolidadas', EstadisticasController.getEstadisticas);

/**
 * @swagger
 * /api/estadisticas/historial:
 *   post:
 *     summary: Crear historial integral
 *     tags: [Estadísticas]
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
 *             properties:
 *               fecha:
 *                 type: string
 *                 format: date
 *                 example: 2026-05-20
 *               idRegistroActividad:
 *                 type: integer
 *                 example: 1
 *               idRegistroIngesta:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Historial creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 historial:
 *                   $ref: '#/components/schemas/HistorialIntegral'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token no válido
 *       500:
 *         description: Error interno del servidor
 */
router.post('/historial', EstadisticasController.createHistorial);

export default router;
