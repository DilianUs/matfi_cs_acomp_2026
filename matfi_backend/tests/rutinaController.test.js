import { jest } from '@jest/globals';
import RutinaController from '../src/controllers/rutinaController.js';
import pool from '../src/config/database.js';

let createdRutinaId = null;

const sampleRutina = {
  nombreRutina: `RutinaTest_${Date.now()}`,
  descripcionRutina: 'Rutina de prueba para test',
};

afterAll(async () => {
  if (createdRutinaId) {
    await pool.query('DELETE FROM Rutina WHERE id_rutina = $1', [createdRutinaId]);
  }
});

describe('RutinaController', () => {
  test('getAll returns empty array initially', async () => {
    const req = {};
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RutinaController.getAll(req, res);

    expect(res.json).toHaveBeenCalled();
    const data = res.json.mock.calls[0][0];
    expect(Array.isArray(data)).toBe(true);
  });

  test('create creates a new rutina', async () => {
    const req = { body: sampleRutina };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RutinaController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    const data = res.json.mock.calls[0][0];
    expect(data).toHaveProperty('id_rutina');
    expect(data.nombre_rutina).toBe(sampleRutina.nombreRutina);
    createdRutinaId = data.id_rutina;
  });

  test('getAll returns the created rutina', async () => {
    const req = {};
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RutinaController.getAll(req, res);

    const data = res.json.mock.calls[0][0];
    expect(data.some((r) => r.id_rutina === createdRutinaId)).toBe(true);
  });

  test('update modifies an existing rutina', async () => {
    const updatedName = `RutinaUpdated_${Date.now()}`;
    const req = {
      params: { id: createdRutinaId },
      body: { nombreRutina: updatedName, descripcionRutina: 'Actualizada' },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RutinaController.update(req, res);

    const data = res.json.mock.calls[0][0];
    expect(data.nombre_rutina).toBe(updatedName);
  });

  test('update returns 404 for non-existent rutina', async () => {
    const req = {
      params: { id: 999999 },
      body: { nombreRutina: 'No existe', descripcionRutina: 'test' },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RutinaController.update(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('create returns 400 when nombre is empty', async () => {
    const req = { body: { nombreRutina: '', descripcionRutina: 'test' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RutinaController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('create returns 400 when ejercicios is not an array', async () => {
    const req = {
      body: { nombreRutina: 'Test', descripcionRutina: 'test', ejercicios: 'no-array' },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RutinaController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('delete removes the rutina', async () => {
    const req = { params: { id: createdRutinaId } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RutinaController.delete(req, res);

    expect(res.json).toHaveBeenCalled();

    const verifyRes = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    await RutinaController.update(
      { params: { id: createdRutinaId }, body: { nombreRutina: 'x', descripcionRutina: 'x' } },
      verifyRes
    );
    expect(verifyRes.status).toHaveBeenCalledWith(404);
    createdRutinaId = null;
  });

  test('delete returns 404 for non-existent rutina', async () => {
    const req = { params: { id: 999999 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RutinaController.delete(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
