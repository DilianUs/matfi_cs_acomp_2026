import { jest } from '@jest/globals';
import IngredienteController from '../src/controllers/ingredienteController.js';
import pool from '../src/config/database.js';

let createdIngredientId = null;

const sampleIngredient = {
  nombreIngrediente: `IngredienteTest_${Date.now()}`,
  unidad: 'gramos',
};

afterAll(async () => {
  if (createdIngredientId) {
    await pool.query('DELETE FROM Ingrediente WHERE id_ingrediente = $1', [createdIngredientId]);
  }
});

describe('IngredienteController', () => {
  test('getAll returns empty array initially', async () => {
    const req = {};
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await IngredienteController.getAll(req, res);

    expect(res.json).toHaveBeenCalled();
    const data = res.json.mock.calls[0][0];
    expect(Array.isArray(data)).toBe(true);
  });

  test('create creates a new ingrediente', async () => {
    const req = { body: sampleIngredient };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await IngredienteController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    const data = res.json.mock.calls[0][0];
    expect(data).toHaveProperty('id_ingrediente');
    expect(data.nombre_ingrediente).toBe(sampleIngredient.nombreIngrediente);
    createdIngredientId = data.id_ingrediente;
  });

  test('getAll returns the created ingrediente', async () => {
    const req = {};
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await IngredienteController.getAll(req, res);

    const data = res.json.mock.calls[0][0];
    expect(data.some((i) => i.id_ingrediente === createdIngredientId)).toBe(true);
  });

  test('update modifies an existing ingrediente', async () => {
    const updatedName = `IngredienteUpdated_${Date.now()}`;
    const req = {
      params: { id: createdIngredientId },
      body: { nombreIngrediente: updatedName, unidad: 'litros' },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await IngredienteController.update(req, res);

    const data = res.json.mock.calls[0][0];
    expect(data.nombre_ingrediente).toBe(updatedName);
    expect(data.unidad).toBe('litros');
  });

  test('update returns 404 for non-existent ingrediente', async () => {
    const req = {
      params: { id: 999999 },
      body: { nombreIngrediente: 'No existe', unidad: 'unidad' },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await IngredienteController.update(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('create returns 400 when nombre is empty', async () => {
    const req = { body: { nombreIngrediente: '', unidad: 'unidad' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await IngredienteController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('delete removes the ingrediente', async () => {
    const req = { params: { id: createdIngredientId } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await IngredienteController.delete(req, res);

    expect(res.json).toHaveBeenCalled();

    const verifyRes = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    await IngredienteController.update(
      { params: { id: createdIngredientId }, body: { nombreIngrediente: 'x', unidad: 'x' } },
      verifyRes
    );
    expect(verifyRes.status).toHaveBeenCalledWith(404);
    createdIngredientId = null;
  });

  test('delete returns 404 for non-existent ingrediente', async () => {
    const req = { params: { id: 999999 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await IngredienteController.delete(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
