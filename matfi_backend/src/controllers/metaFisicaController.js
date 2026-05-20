import MetaFisicaModel from '../models/metaFisicaModel.js';
import ValidationUtils from '../utils/validation.js';

class MetaFisicaController {
  // Obtener todas las metas físicas del usuario autenticado
  static async getAll(req, res) {
    try {
      const metas = await MetaFisicaModel.findByUserId(req.user.idUsuario);
      res.json(metas);
    } catch (error) {
      console.error('Error al obtener metas físicas:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Crear nueva meta física
  static async create(req, res) {
    try {
      const { tipoDeMetaFisica, caloriasObjetivo, fechaInicio, fechaFin } = req.body;

      // Validaciones
      const tiposValidos = ['perdida', 'ganancia', 'mantenimiento'];
      if (!tipoDeMetaFisica || !tiposValidos.includes(tipoDeMetaFisica)) {
        return res.status(400).json({ error: 'tipo_de_meta debe ser: perdida, ganancia o mantenimiento' });
      }

      if (!ValidationUtils.isPositiveNumber(caloriasObjetivo)) {
        return res.status(400).json({ error: 'Calorías objetivo debe ser un número positivo' });
      }

      if (!fechaInicio || !ValidationUtils.isValidDate(fechaInicio)) {
        return res.status(400).json({ error: 'Fecha inicio es requerida y debe ser válida (YYYY-MM-DD)' });
      }

      if (!fechaFin || !ValidationUtils.isValidDate(fechaFin)) {
        return res.status(400).json({ error: 'Fecha fin es requerida y debe ser válida (YYYY-MM-DD)' });
      }

      // Validar que fechaFin sea mayor que fechaInicio
      if (new Date(fechaFin) <= new Date(fechaInicio)) {
        return res.status(400).json({ error: 'Fecha fin debe ser posterior a fecha inicio' });
      }

      const nuevaMeta = await MetaFisicaModel.create({
        idUsuario: req.user.idUsuario,
        tipoDeMetaFisica,
        caloriasObjetivo,
        fechaInicio,
        fechaFin
      });

      res.status(201).json({
        message: 'Meta física creada exitosamente',
        meta: nuevaMeta
      });
    } catch (error) {
      console.error('Error al crear meta física:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Actualizar meta física
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { tipoDeMetaFisica, caloriasObjetivo, fechaInicio, fechaFin } = req.body;

      // Verificar que la meta existe y pertenece al usuario
      const meta = await MetaFisicaModel.findById(id);
      if (!meta) {
        return res.status(404).json({ error: 'Meta física no encontrada' });
      }

      if (!await MetaFisicaModel.isOwner(id, req.user.idUsuario)) {
        return res.status(403).json({ error: 'No tienes permiso para actualizar esta meta' });
      }

      // Validaciones si se envían los datos
      if (tipoDeMetaFisica) {
        const tiposValidos = ['perdida', 'ganancia', 'mantenimiento'];
        if (!tiposValidos.includes(tipoDeMetaFisica)) {
          return res.status(400).json({ error: 'tipo_de_meta debe ser: perdida, ganancia o mantenimiento' });
        }
      }

      if (caloriasObjetivo && !ValidationUtils.isPositiveNumber(caloriasObjetivo)) {
        return res.status(400).json({ error: 'Calorías objetivo debe ser un número positivo' });
      }

      if (fechaInicio && !ValidationUtils.isValidDate(fechaInicio)) {
        return res.status(400).json({ error: 'Fecha inicio debe ser válida (YYYY-MM-DD)' });
      }

      if (fechaFin && !ValidationUtils.isValidDate(fechaFin)) {
        return res.status(400).json({ error: 'Fecha fin debe ser válida (YYYY-MM-DD)' });
      }

      // Validar fechas si se actualizan ambas
      if (fechaInicio && fechaFin) {
        if (new Date(fechaFin) <= new Date(fechaInicio)) {
          return res.status(400).json({ error: 'Fecha fin debe ser posterior a fecha inicio' });
        }
      }

      const metaActualizada = await MetaFisicaModel.update(id, {
        tipoDeMetaFisica,
        caloriasObjetivo,
        fechaInicio,
        fechaFin
      });

      res.json({
        message: 'Meta física actualizada exitosamente',
        meta: metaActualizada
      });
    } catch (error) {
      console.error('Error al actualizar meta física:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Eliminar meta física
  static async delete(req, res) {
    try {
      const { id } = req.params;

      // Verificar que la meta existe
      const meta = await MetaFisicaModel.findById(id);
      if (!meta) {
        return res.status(404).json({ error: 'Meta física no encontrada' });
      }

      // Verificar que pertenece al usuario autenticado
      if (!await MetaFisicaModel.isOwner(id, req.user.idUsuario)) {
        return res.status(403).json({ error: 'No tienes permiso para eliminar esta meta' });
      }

      await MetaFisicaModel.delete(id);
      res.json({ message: 'Meta física eliminada correctamente' });
    } catch (error) {
      console.error('Error al eliminar meta física:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

export default MetaFisicaController;
