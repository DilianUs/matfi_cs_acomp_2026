import RegistroIngestaAlimenticiModel from '../models/registroIngestaAlimenticiModel.js';
import ValidationUtils from '../utils/validation.js';

class RegistroIngestaAlimenticiController {
  // Obtener todos los registros del usuario
  static async getAll(req, res) {
    try {
      const registros = await RegistroIngestaAlimenticiModel.findByUserId(req.user.idUsuario);
      res.json(registros);
    } catch (error) {
      console.error('Error al obtener registros de ingesta:', error);
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

      const registros = await RegistroIngestaAlimenticiModel.findByUserAndDate(req.user.idUsuario, fecha);
      res.json(registros);
    } catch (error) {
      console.error('Error al obtener registros por fecha:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Crear nuevo registro de ingesta
  static async create(req, res) {
    try {
      const { fecha, caloriasConsumidas } = req.body;

      // Validaciones
      if (!fecha || !ValidationUtils.isValidDate(fecha)) {
        return res.status(400).json({ error: 'Fecha es requerida y debe ser válida (YYYY-MM-DD)' });
      }

      if (!caloriasConsumidas || !ValidationUtils.isPositiveNumber(caloriasConsumidas)) {
        return res.status(400).json({ error: 'Calorías consumidas es requerido y debe ser un número positivo' });
      }

      const nuevoRegistro = await RegistroIngestaAlimenticiModel.create({
        idUsuario: req.user.idUsuario,
        fecha,
        caloriasConsumidas
      });

      res.status(201).json({
        message: 'Registro de ingesta creado exitosamente',
        registro: nuevoRegistro
      });
    } catch (error) {
      console.error('Error al crear registro de ingesta:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Actualizar registro de ingesta
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { caloriasConsumidas } = req.body;

      // Verificar que existe
      const registro = await RegistroIngestaAlimenticiModel.findById(id);
      if (!registro) {
        return res.status(404).json({ error: 'Registro de ingesta no encontrado' });
      }

      // Verificar permisos
      if (!await RegistroIngestaAlimenticiModel.isOwner(id, req.user.idUsuario)) {
        return res.status(403).json({ error: 'No tienes permiso para actualizar este registro' });
      }

      // Validaciones
      if (caloriasConsumidas && !ValidationUtils.isPositiveNumber(caloriasConsumidas)) {
        return res.status(400).json({ error: 'Calorías consumidas debe ser un número positivo' });
      }

      const registroActualizado = await RegistroIngestaAlimenticiModel.update(id, {
        caloriasConsumidas
      });

      res.json({
        message: 'Registro de ingesta actualizado exitosamente',
        registro: registroActualizado
      });
    } catch (error) {
      console.error('Error al actualizar registro de ingesta:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Eliminar registro de ingesta
  static async delete(req, res) {
    try {
      const { id } = req.params;

      // Verificar que existe
      const registro = await RegistroIngestaAlimenticiModel.findById(id);
      if (!registro) {
        return res.status(404).json({ error: 'Registro de ingesta no encontrado' });
      }

      // Verificar permisos
      if (!await RegistroIngestaAlimenticiModel.isOwner(id, req.user.idUsuario)) {
        return res.status(403).json({ error: 'No tienes permiso para eliminar este registro' });
      }

      await RegistroIngestaAlimenticiModel.delete(id);
      res.json({ message: 'Registro de ingesta eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar registro de ingesta:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Agregar receta a registro
  static async addReceta(req, res) {
    try {
      const { id } = req.params;
      const { idReceta } = req.body;

      if (!idReceta) {
        return res.status(400).json({ error: 'idReceta es requerido' });
      }

      // Verificar que el registro existe
      const registro = await RegistroIngestaAlimenticiModel.findById(id);
      if (!registro) {
        return res.status(404).json({ error: 'Registro de ingesta no encontrado' });
      }

      // Verificar permisos
      if (!await RegistroIngestaAlimenticiModel.isOwner(id, req.user.idUsuario)) {
        return res.status(403).json({ error: 'No tienes permiso para modificar este registro' });
      }

      const receta = await RegistroIngestaAlimenticiModel.addReceta(id, idReceta);

      res.status(201).json({
        message: 'Receta agregada al registro exitosamente',
        receta
      });
    } catch (error) {
      console.error('Error al agregar receta:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Eliminar receta de registro
  static async removeReceta(req, res) {
    try {
      const { id, idReceta } = req.params;

      // Verificar que el registro existe
      const registro = await RegistroIngestaAlimenticiModel.findById(id);
      if (!registro) {
        return res.status(404).json({ error: 'Registro de ingesta no encontrado' });
      }

      // Verificar permisos
      if (!await RegistroIngestaAlimenticiModel.isOwner(id, req.user.idUsuario)) {
        return res.status(403).json({ error: 'No tienes permiso para modificar este registro' });
      }

      await RegistroIngestaAlimenticiModel.removeReceta(id, idReceta);

      res.json({ message: 'Receta eliminada del registro correctamente' });
    } catch (error) {
      console.error('Error al eliminar receta:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

export default RegistroIngestaAlimenticiController;
