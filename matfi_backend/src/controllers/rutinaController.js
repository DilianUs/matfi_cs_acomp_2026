import RutinaModel from '../models/rutinaModel.js';
import ValidationUtils from '../utils/validation.js';

class RutinaController {
  static async getAll(req, res) {
    try {
      const rutinas = await RutinaModel.findAll();
      res.json(rutinas);
    } catch (error) {
      console.error('Error al obtener rutinas:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  static async create(req, res) {
    try {
      const { nombreRutina, descripcionRutina, imagenMusculosTrabajados, ejercicios } = req.body;
      if (!ValidationUtils.isNotEmpty(nombreRutina)) {
        return res.status(400).json({ error: 'Nombre de rutina es requerido' });
      }

      if (ejercicios && !Array.isArray(ejercicios)) {
        return res.status(400).json({ error: 'Ejercicios debe ser un arreglo' });
      }

      const nuevaRutina = await RutinaModel.create(
        { nombreRutina, descripcionRutina, imagenMusculosTrabajados },
        ejercicios
      );
      res.status(201).json(nuevaRutina);
    } catch (error) {
      console.error('Error al crear rutina:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { nombreRutina, descripcionRutina, imagenMusculosTrabajados, ejercicios } = req.body;
      if (!ValidationUtils.isNotEmpty(nombreRutina)) {
        return res.status(400).json({ error: 'Nombre de rutina es requerido' });
      }

      if (ejercicios && !Array.isArray(ejercicios)) {
        return res.status(400).json({ error: 'Ejercicios debe ser un arreglo' });
      }

      const rutinaActualizada = await RutinaModel.update(
        id,
        { nombreRutina, descripcionRutina, imagenMusculosTrabajados },
        ejercicios
      );
      if (!rutinaActualizada) {
        return res.status(404).json({ error: 'Rutina no encontrada' });
      }

      res.json(rutinaActualizada);
    } catch (error) {
      console.error('Error al actualizar rutina:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const rutina = await RutinaModel.findById(id);
      if (!rutina) {
        return res.status(404).json({ error: 'Rutina no encontrada' });
      }

      await RutinaModel.delete(id);
      res.json({ message: 'Rutina eliminada correctamente' });
    } catch (error) {
      console.error('Error al eliminar rutina:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

export default RutinaController;
