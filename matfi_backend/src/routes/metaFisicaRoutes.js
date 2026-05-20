import express from 'express';
import MetaFisicaController from '../controllers/metaFisicaController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

/**
 * @swagger
 * /api/metaFisica:
 *   get:
 *     summary: Obtener todas las metas físicas del usuario
 *     tags: [Meta Física]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de metas físicas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MetaFisica'
 *       401:
 *         description: Token no válido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', MetaFisicaController.getAll);

/**
 * @swagger
 * /api/metaFisica:
 *   post:
 *     summary: Crear nueva meta física
 *     tags: [Meta Física]
 *     description: El `idUsuario` se extrae del token Bearer (cabecera Authorization). No incluir `idUsuario` en el body; el servidor lo asigna automáticamente.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tipoDeMetaFisica
 *               - caloriasObjetivo
 *               - fechaInicio
 *               - fechaFin
 *             properties:
 *               tipoDeMetaFisica:
 *                 type: string
 *                 enum: [perdida, ganancia, mantenimiento]
 *                 example: perdida
 *               caloriasObjetivo:
 *                 type: number
 *                 example: 2000
 *               fechaInicio:
 *                 type: string
 *                 format: date
 *                 example: 2026-05-20
 *               fechaFin:
 *                 type: string
 *                 format: date
 *                 example: 2026-08-20
 *     responses:
 *       201:
 *         description: Meta física creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 meta:
 *                   $ref: '#/components/schemas/MetaFisica'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token no válido
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', MetaFisicaController.create);

/**
 * @swagger
 * /api/metaFisica/{id}:
 *   put:
 *     summary: Actualizar meta física
 *     tags: [Meta Física]
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
 *               tipoDeMetaFisica:
 *                 type: string
 *                 enum: [perdida, ganancia, mantenimiento]
 *               caloriasObjetivo:
 *                 type: number
 *               fechaInicio:
 *                 type: string
 *                 format: date
 *               fechaFin:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Meta física actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 meta:
 *                   $ref: '#/components/schemas/MetaFisica'
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: Sin permiso para actualizar
 *       404:
 *         description: Meta no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', MetaFisicaController.update);

/**
 * @swagger
 * /api/metaFisica/{id}:
 *   delete:
 *     summary: Eliminar meta física
 *     tags: [Meta Física]
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
 *         description: Meta física eliminada correctamente
 *       403:
 *         description: Sin permiso para eliminar
 *       404:
 *         description: Meta no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', MetaFisicaController.delete);

export default router;
