import RecetaModel from '../models/recetaModel.js';
import ValidationUtils from '../utils/validation.js';

class RecetaController {
  static async getAll(req, res) {
    try {
      const recetas = await RecetaModel.findAll();
      res.json(recetas);
    } catch (error) {
      console.error('Error al obtener recetas:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  static async create(req, res) {
    try {
      const {
        nombreReceta,
        imagenAlusiva,
        descripcionGeneral,
        pasosPreparacion,
        caloriasAproximadas,
        ingredientes,
      } = req.body;
      if (!ValidationUtils.isNotEmpty(nombreReceta)) {
        return res.status(400).json({ error: 'Nombre de receta es requerido' });
      }

      if (ingredientes && !Array.isArray(ingredientes)) {
        return res.status(400).json({ error: 'Ingredientes debe ser un arreglo' });
      }

      const nuevaReceta = await RecetaModel.create(
        { nombreReceta, imagenAlusiva, descripcionGeneral, pasosPreparacion, caloriasAproximadas },
        ingredientes
      );
      res.status(201).json(nuevaReceta);
    } catch (error) {
      console.error('Error al crear receta:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const {
        nombreReceta,
        imagenAlusiva,
        descripcionGeneral,
        pasosPreparacion,
        caloriasAproximadas,
        ingredientes,
      } = req.body;
      if (!ValidationUtils.isNotEmpty(nombreReceta)) {
        return res.status(400).json({ error: 'Nombre de receta es requerido' });
      }

      if (ingredientes && !Array.isArray(ingredientes)) {
        return res.status(400).json({ error: 'Ingredientes debe ser un arreglo' });
      }

      const recetaActualizada = await RecetaModel.update(
        id,
        { nombreReceta, imagenAlusiva, descripcionGeneral, pasosPreparacion, caloriasAproximadas },
        ingredientes
      );
      if (!recetaActualizada) {
        return res.status(404).json({ error: 'Receta no encontrada' });
      }

      res.json(recetaActualizada);
    } catch (error) {
      console.error('Error al actualizar receta:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const receta = await RecetaModel.findById(id);
      if (!receta) {
        return res.status(404).json({ error: 'Receta no encontrada' });
      }

      await RecetaModel.delete(id);
      res.json({ message: 'Receta eliminada correctamente' });
    } catch (error) {
      console.error('Error al eliminar receta:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

export default RecetaController;
