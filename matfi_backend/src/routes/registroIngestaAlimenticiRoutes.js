import express from 'express';
import RegistroIngestaAlimenticiController from '../controllers/registroIngestaAlimenticiController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

/**
 * @swagger
 * /api/registrosIngesta:
 *   get:
 *     summary: Obtener todos los registros de ingesta del usuario
 *     tags: [Registro Ingesta Alimenticia]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de registros de ingesta
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RegistroIngestaAlimenticia'
 *       401:
 *         description: Token no válido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', RegistroIngestaAlimenticiController.getAll);

/**
 * @swagger
 * /api/registrosIngesta/byDate:
 *   get:
 *     summary: Obtener registros de ingesta por fecha
 *     tags: [Registro Ingesta Alimenticia]
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
 *                 $ref: '#/components/schemas/RegistroIngestaAlimenticia'
 *       400:
 *         description: Fecha inválida
 *       401:
 *         description: Token no válido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/byDate', RegistroIngestaAlimenticiController.getByDate);

/**
 * @swagger
 * /api/registrosIngesta:
 *   post:
 *     summary: Crear nuevo registro de ingesta alimenticia
 *     tags: [Registro Ingesta Alimenticia]
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
 *               - caloriasConsumidas
 *             properties:
 *               fecha:
 *                 type: string
 *                 format: date
 *                 example: 2026-05-20
 *               caloriasConsumidas:
 *                 type: integer
 *                 example: 2000
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
 *                   $ref: '#/components/schemas/RegistroIngestaAlimenticia'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token no válido
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', RegistroIngestaAlimenticiController.create);

/**
 * @swagger
 * /api/registrosIngesta/{id}:
 *   put:
 *     summary: Actualizar registro de ingesta alimenticia
 *     tags: [Registro Ingesta Alimenticia]
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
 *               caloriasConsumidas:
 *                 type: integer
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
router.put('/:id', RegistroIngestaAlimenticiController.update);

/**
 * @swagger
 * /api/registrosIngesta/{id}:
 *   delete:
 *     summary: Eliminar registro de ingesta alimenticia
 *     tags: [Registro Ingesta Alimenticia]
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
router.delete('/:id', RegistroIngestaAlimenticiController.delete);

/**
 * @swagger
 * /api/registrosIngesta/{id}/recetas:
 *   post:
 *     summary: Agregar receta a registro de ingesta
 *     tags: [Registro Ingesta Alimenticia]
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
 *               - idReceta
 *             properties:
 *               idReceta:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Receta agregada exitosamente
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: Sin permiso
 *       404:
 *         description: Registro no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/:id/recetas', RegistroIngestaAlimenticiController.addReceta);

/**
 * @swagger
 * /api/registrosIngesta/{id}/recetas/{idReceta}:
 *   delete:
 *     summary: Eliminar receta de registro de ingesta
 *     tags: [Registro Ingesta Alimenticia]
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
 *         name: idReceta
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Receta eliminada correctamente
 *       403:
 *         description: Sin permiso
 *       404:
 *         description: Registro no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id/recetas/:idReceta', RegistroIngestaAlimenticiController.removeReceta);

export default router;
