import IngredienteModel from '../models/ingredienteModel.js';
import ValidationUtils from '../utils/validation.js';

class IngredienteController {
  static async getAll(req, res) {
    try {
      const ingredientes = await IngredienteModel.findAll();
      res.json(ingredientes);
    } catch (error) {
      console.error('Error al obtener ingredientes:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  static async create(req, res) {
    try {
      const { nombreIngrediente, unidad } = req.body;
      if (!ValidationUtils.isNotEmpty(nombreIngrediente)) {
        return res.status(400).json({ error: 'Nombre de ingrediente es requerido' });
      }

      const nuevoIngrediente = await IngredienteModel.create({ nombreIngrediente, unidad });
      res.status(201).json(nuevoIngrediente);
    } catch (error) {
      console.error('Error al crear ingrediente:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { nombreIngrediente, unidad } = req.body;

      if (!ValidationUtils.isNotEmpty(nombreIngrediente)) {
        return res.status(400).json({ error: 'Nombre de ingrediente es requerido' });
      }

      const ingredienteActualizado = await IngredienteModel.update(id, { nombreIngrediente, unidad });
      if (!ingredienteActualizado) {
        return res.status(404).json({ error: 'Ingrediente no encontrado' });
      }

      res.json(ingredienteActualizado);
    } catch (error) {
      console.error('Error al actualizar ingrediente:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const ingrediente = await IngredienteModel.findById(id);
      if (!ingrediente) {
        return res.status(404).json({ error: 'Ingrediente no encontrado' });
      }

      await IngredienteModel.delete(id);
      res.json({ message: 'Ingrediente eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar ingrediente:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

export default IngredienteController;