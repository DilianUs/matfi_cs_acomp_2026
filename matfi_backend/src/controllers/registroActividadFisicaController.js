import RegistroActividadFisicaModel from '../models/registroActividadFisicaModel.js';
import ValidationUtils from '../utils/validation.js';

class RegistroActividadFisicaController {
  // Obtener todos los registros del usuario
  static async getAll(req, res) {
    try {
      const registros = await RegistroActividadFisicaModel.findByUserId(req.user.idUsuario);
      res.json(registros);
    } catch (error) {
      console.error('Error al obtener registros de actividad:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Obtener registros por fecha
  static async getByDate(req, res) {
    try {
      const { fecha } = req.query;

      if (!fecha || !ValidationUtils.isValidDate(fecha)) {
        return res.status(400).json({ error: 'Fecha es requerida y debe ser válida (YYYY-MM-DD)' });
      }

      const registros = await RegistroActividadFisicaModel.findByUserAndDate(
        req.user.idUsuario,
        fecha
      );
      res.json(registros);
    } catch (error) {
      console.error('Error al obtener registros por fecha:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Crear nuevo registro de actividad
  static async create(req, res) {
    try {
      const { fecha, caloriasQuemadas, tiempoInvertido, nivelDeIntensidad } = req.body;

      // Validaciones
      if (!fecha || !ValidationUtils.isValidDate(fecha)) {
        return res.status(400).json({ error: 'Fecha es requerida y debe ser válida (YYYY-MM-DD)' });
      }

      if (caloriasQuemadas && !ValidationUtils.isPositiveNumber(caloriasQuemadas)) {
        return res.status(400).json({ error: 'Calorías quemadas debe ser un número positivo' });
      }

      if (tiempoInvertido && !ValidationUtils.isPositiveNumber(tiempoInvertido)) {
        return res.status(400).json({ error: 'Tiempo invertido debe ser un número positivo' });
      }

      const nivelesValidos = ['baja', 'media', 'alta'];
      if (nivelDeIntensidad && !nivelesValidos.includes(nivelDeIntensidad)) {
        return res.status(400).json({ error: 'Nivel de intensidad debe ser: baja, media o alta' });
      }

      const nuevoRegistro = await RegistroActividadFisicaModel.create({
        idUsuario: req.user.idUsuario,
        fecha,
        caloriasQuemadas,
        tiempoInvertido,
        nivelDeIntensidad,
      });

      res.status(201).json({
        message: 'Registro de actividad creado exitosamente',
        registro: nuevoRegistro,
      });
    } catch (error) {
      console.error('Error al crear registro de actividad:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Actualizar registro de actividad
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { caloriasQuemadas, tiempoInvertido, nivelDeIntensidad } = req.body;

      // Verificar que existe
      const registro = await RegistroActividadFisicaModel.findById(id);
      if (!registro) {
        return res.status(404).json({ error: 'Registro de actividad no encontrado' });
      }

      // Verificar permisos
      if (!(await RegistroActividadFisicaModel.isOwner(id, req.user.idUsuario))) {
        return res.status(403).json({ error: 'No tienes permiso para actualizar este registro' });
      }

      // Validaciones
      if (caloriasQuemadas && !ValidationUtils.isPositiveNumber(caloriasQuemadas)) {
        return res.status(400).json({ error: 'Calorías quemadas debe ser un número positivo' });
      }

      if (tiempoInvertido && !ValidationUtils.isPositiveNumber(tiempoInvertido)) {
        return res.status(400).json({ error: 'Tiempo invertido debe ser un número positivo' });
      }

      const nivelesValidos = ['baja', 'media', 'alta'];
      if (nivelDeIntensidad && !nivelesValidos.includes(nivelDeIntensidad)) {
        return res.status(400).json({ error: 'Nivel de intensidad debe ser: baja, media o alta' });
      }

      const registroActualizado = await RegistroActividadFisicaModel.update(id, {
        caloriasQuemadas,
        tiempoInvertido,
        nivelDeIntensidad,
      });

      res.json({
        message: 'Registro de actividad actualizado exitosamente',
        registro: registroActualizado,
      });
    } catch (error) {
      console.error('Error al actualizar registro de actividad:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Eliminar registro de actividad
  static async delete(req, res) {
    try {
      const { id } = req.params;

      // Verificar que existe
      const registro = await RegistroActividadFisicaModel.findById(id);
      if (!registro) {
        return res.status(404).json({ error: 'Registro de actividad no encontrado' });
      }

      // Verificar permisos
      if (!(await RegistroActividadFisicaModel.isOwner(id, req.user.idUsuario))) {
        return res.status(403).json({ error: 'No tienes permiso para eliminar este registro' });
      }

      await RegistroActividadFisicaModel.delete(id);
      res.json({ message: 'Registro de actividad eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar registro de actividad:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Agregar rutina a registro
  static async addRutina(req, res) {
    try {
      const { id } = req.params;
      const { idRutina } = req.body;

      if (!idRutina) {
        return res.status(400).json({ error: 'idRutina es requerido' });
      }

      // Verificar que el registro existe
      const registro = await RegistroActividadFisicaModel.findById(id);
      if (!registro) {
        return res.status(404).json({ error: 'Registro de actividad no encontrado' });
      }

      // Verificar permisos
      if (!(await RegistroActividadFisicaModel.isOwner(id, req.user.idUsuario))) {
        return res.status(403).json({ error: 'No tienes permiso para modificar este registro' });
      }

      const rutina = await RegistroActividadFisicaModel.addRutina(id, idRutina);

      res.status(201).json({
        message: 'Rutina agregada al registro exitosamente',
        rutina,
      });
    } catch (error) {
      console.error('Error al agregar rutina:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Eliminar rutina de registro
  static async removeRutina(req, res) {
    try {
      const { id, idRutina } = req.params;

      // Verificar que el registro existe
      const registro = await RegistroActividadFisicaModel.findById(id);
      if (!registro) {
        return res.status(404).json({ error: 'Registro de actividad no encontrado' });
      }

      // Verificar permisos
      if (!(await RegistroActividadFisicaModel.isOwner(id, req.user.idUsuario))) {
        return res.status(403).json({ error: 'No tienes permiso para modificar este registro' });
      }

      await RegistroActividadFisicaModel.removeRutina(id, idRutina);

      res.json({ message: 'Rutina eliminada del registro correctamente' });
    } catch (error) {
      console.error('Error al eliminar rutina:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

export default RegistroActividadFisicaController;
