import EjercicioModel from '../models/ejercicioModel.js';
import ValidationUtils from '../utils/validation.js';

class EjercicioController {
  static async getAll(req, res) {
    try {
      const ejercicios = await EjercicioModel.findAll();
      res.json(ejercicios);
    } catch (error) {
      console.error('Error al obtener ejercicios:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  static async create(req, res) {
    try {
      const {
        nombreEjercicio,
        cantidadSeries,
        cantidadRepeticiones,
        descripcionEjercicio,
        videoEjercicio,
      } = req.body;
      if (!ValidationUtils.isNotEmpty(nombreEjercicio)) {
        return res.status(400).json({ error: 'Nombre de ejercicio es requerido' });
      }

      const nuevoEjercicio = await EjercicioModel.create({
        nombreEjercicio,
        cantidadSeries,
        cantidadRepeticiones,
        descripcionEjercicio,
        videoEjercicio,
      });
      res.status(201).json(nuevoEjercicio);
    } catch (error) {
      console.error('Error al crear ejercicio:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const {
        nombreEjercicio,
        cantidadSeries,
        cantidadRepeticiones,
        descripcionEjercicio,
        videoEjercicio,
      } = req.body;
      if (!ValidationUtils.isNotEmpty(nombreEjercicio)) {
        return res.status(400).json({ error: 'Nombre de ejercicio es requerido' });
      }

      const ejercicioActualizado = await EjercicioModel.update(id, {
        nombreEjercicio,
        cantidadSeries,
        cantidadRepeticiones,
        descripcionEjercicio,
        videoEjercicio,
      });
      if (!ejercicioActualizado) {
        return res.status(404).json({ error: 'Ejercicio no encontrado' });
      }

      res.json(ejercicioActualizado);
    } catch (error) {
      console.error('Error al actualizar ejercicio:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const ejercicio = await EjercicioModel.findById(id);
      if (!ejercicio) {
        return res.status(404).json({ error: 'Ejercicio no encontrado' });
      }

      await EjercicioModel.delete(id);
      res.json({ message: 'Ejercicio eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar ejercicio:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

export default EjercicioController;
