import HistorialIntegralModel from '../models/historialIntegralModel.js';
import ValidationUtils from '../utils/validation.js';

class EstadisticasController {
  // Obtener historial integral del usuario
  static async getHistorial(req, res) {
    try {
      const historial = await HistorialIntegralModel.findByUserId(req.user.idUsuario);
      res.json(historial);
    } catch (error) {
      console.error('Error al obtener historial:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Obtener historial por rango de fechas
  static async getHistorialByDateRange(req, res) {
    try {
      const { fechaInicio, fechaFin } = req.query;

      if (!fechaInicio || !ValidationUtils.isValidDate(fechaInicio)) {
        return res.status(400).json({ error: 'fechaInicio es requerida y debe ser válida (YYYY-MM-DD)' });
      }

      if (!fechaFin || !ValidationUtils.isValidDate(fechaFin)) {
        return res.status(400).json({ error: 'fechaFin es requerida y debe ser válida (YYYY-MM-DD)' });
      }

      if (new Date(fechaFin) < new Date(fechaInicio)) {
        return res.status(400).json({ error: 'fechaFin debe ser igual o posterior a fechaInicio' });
      }

      const historial = await HistorialIntegralModel.findByUserAndDateRange(
        req.user.idUsuario,
        fechaInicio,
        fechaFin
      );
      res.json(historial);
    } catch (error) {
      console.error('Error al obtener historial por rango de fechas:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Obtener estadísticas consolidadas
  static async getEstadisticas(req, res) {
    try {
      const { fechaInicio, fechaFin } = req.query;

      let estadisticas;

      if (fechaInicio && fechaFin) {
        if (!ValidationUtils.isValidDate(fechaInicio) || !ValidationUtils.isValidDate(fechaFin)) {
          return res.status(400).json({ error: 'Fechas deben ser válidas (YYYY-MM-DD)' });
        }

        if (new Date(fechaFin) < new Date(fechaInicio)) {
          return res.status(400).json({ error: 'fechaFin debe ser igual o posterior a fechaInicio' });
        }

        estadisticas = await HistorialIntegralModel.getEstadisticas(
          req.user.idUsuario,
          fechaInicio,
          fechaFin
        );
      } else {
        estadisticas = await HistorialIntegralModel.getEstadisticas(req.user.idUsuario);
      }

      if (!estadisticas) {
        return res.status(404).json({ error: 'No hay datos disponibles' });
      }

      // Convertir strings a números
      const result = {
        totalRegistrosActividad: parseInt(estadisticas.total_registros_actividad) || 0,
        caloriasQuemadasTotal: parseFloat(estadisticas.calorias_quemadas_total) || 0,
        tiempoInvertidoTotal: parseFloat(estadisticas.tiempo_invertido_total) || 0,
        caloriasQuemadasPromedio: parseFloat(estadisticas.calorias_quemadas_promedio) || 0,
        tiempoInvertidoPromedio: parseFloat(estadisticas.tiempo_invertido_promedio) || 0,
        totalRegistrosIngesta: parseInt(estadisticas.total_registros_ingesta) || 0,
        caloriasConsumidastotal: parseFloat(estadisticas.calorias_consumidas_total) || 0,
        caloriasConsumidasPromedio: parseFloat(estadisticas.calorias_consumidas_promedio) || 0,
        totalRutinasDiferentes: parseInt(estadisticas.total_rutinas_diferentes) || 0,
        totalRecetasDiferentes: parseInt(estadisticas.total_recetas_diferentes) || 0,
        balanceCalorias: (parseFloat(estadisticas.calorias_quemadas_total) || 0) - (parseFloat(estadisticas.calorias_consumidas_total) || 0)
      };

      res.json(result);
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Crear historial integral
  static async createHistorial(req, res) {
    try {
      const { fecha, idRegistroActividad, idRegistroIngesta } = req.body;

      if (!fecha || !ValidationUtils.isValidDate(fecha)) {
        return res.status(400).json({ error: 'Fecha es requerida y debe ser válida (YYYY-MM-DD)' });
      }

      if (!idRegistroActividad && !idRegistroIngesta) {
        return res.status(400).json({ error: 'Al menos uno de idRegistroActividad o idRegistroIngesta es requerido' });
      }

      const nuevoHistorial = await HistorialIntegralModel.create({
        idUsuario: req.user.idUsuario,
        fecha,
        idRegistroActividad,
        idRegistroIngesta
      });

      res.status(201).json({
        message: 'Historial integral creado exitosamente',
        historial: nuevoHistorial
      });
    } catch (error) {
      console.error('Error al crear historial:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

export default EstadisticasController;
