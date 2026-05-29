import { jest } from '@jest/globals';
import EjercicioController from '../src/controllers/ejercicioController.js';
import pool from '../src/config/database.js';

let createdExerciseId = null;

const sampleExercise = {
  nombreEjercicio: `EjercicioTest_${Date.now()}`,
  cantidadSeries: 3,
  cantidadRepeticiones: 12,
  descripcionEjercicio: 'Ejercicio de prueba',
};

afterAll(async () => {
  if (createdExerciseId) {
    await pool.query('DELETE FROM Ejercicio WHERE id_ejercicio = $1', [createdExerciseId]);
  }
  await pool.end();
});

describe('EjercicioController', () => {
  test('getAll returns empty array initially', async () => {
    const req = {};
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await EjercicioController.getAll(req, res);

    expect(res.json).toHaveBeenCalled();
    const data = res.json.mock.calls[0][0];
    expect(Array.isArray(data)).toBe(true);
  });

  test('create creates a new ejercicio', async () => {
    const req = { body: sampleExercise };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await EjercicioController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    const data = res.json.mock.calls[0][0];
    expect(data).toHaveProperty('id_ejercicio');
    expect(data.nombre_ejercicio).toBe(sampleExercise.nombreEjercicio);
    createdExerciseId = data.id_ejercicio;
  });

  test('getAll returns the created ejercicio', async () => {
    const req = {};
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await EjercicioController.getAll(req, res);

    const data = res.json.mock.calls[0][0];
    expect(data.some((e) => e.id_ejercicio === createdExerciseId)).toBe(true);
  });

  test('update modifies an existing ejercicio', async () => {
    const updatedName = `EjercicioUpdated_${Date.now()}`;
    const req = {
      params: { id: createdExerciseId },
      body: {
        nombreEjercicio: updatedName,
        cantidadSeries: 5,
        cantidadRepeticiones: 10,
        descripcionEjercicio: 'Actualizado',
      },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await EjercicioController.update(req, res);

    const data = res.json.mock.calls[0][0];
    expect(data.nombre_ejercicio).toBe(updatedName);
    expect(data.cantidad_series).toBe(5);
  });

  test('update returns 404 for non-existent ejercicio', async () => {
    const req = {
      params: { id: 999999 },
      body: { nombreEjercicio: 'No existe', cantidadSeries: 3, cantidadRepeticiones: 10 },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await EjercicioController.update(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('create returns 400 when nombre is empty', async () => {
    const req = { body: { nombreEjercicio: '', cantidadSeries: 3, cantidadRepeticiones: 10 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await EjercicioController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('delete removes the ejercicio', async () => {
    const req = { params: { id: createdExerciseId } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await EjercicioController.delete(req, res);

    expect(res.json).toHaveBeenCalled();

    // Verify it's gone
    const verifyRes = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    await EjercicioController.update(
      {
        params: { id: createdExerciseId },
        body: { nombreEjercicio: 'x', cantidadSeries: 1, cantidadRepeticiones: 1 },
      },
      verifyRes
    );
    expect(verifyRes.status).toHaveBeenCalledWith(404);
    createdExerciseId = null;
  });

  test('delete returns 404 for non-existent ejercicio', async () => {
    const req = { params: { id: 999999 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await EjercicioController.delete(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
