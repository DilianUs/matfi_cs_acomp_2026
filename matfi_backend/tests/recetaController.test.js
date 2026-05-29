import { jest } from '@jest/globals';
import RecetaController from '../src/controllers/recetaController.js';
import IngredienteModel from '../src/models/ingredienteModel.js';
import pool from '../src/config/database.js';

let createdRecetaId = null;
let createdIngredientId = null;

const sampleReceta = {
  nombreReceta: `RecetaTest_${Date.now()}`,
  descripcionGeneral: 'Receta de prueba para test',
  pasosPreparacion: ['Paso 1', 'Paso 2'],
  caloriasAproximadas: 350,
};

afterAll(async () => {
  if (createdRecetaId) {
    await pool.query('DELETE FROM Receta WHERE id_receta = $1', [createdRecetaId]);
  }
  if (createdIngredientId) {
    await pool.query('DELETE FROM Ingrediente WHERE id_ingrediente = $1', [createdIngredientId]);
  }
});

describe('RecetaController', () => {
  test('getAll returns empty array initially', async () => {
    const req = {};
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RecetaController.getAll(req, res);

    expect(res.json).toHaveBeenCalled();
    const data = res.json.mock.calls[0][0];
    expect(Array.isArray(data)).toBe(true);
  });

  test('create creates a new receta', async () => {
    const req = { body: sampleReceta };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RecetaController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    const data = res.json.mock.calls[0][0];
    expect(data).toHaveProperty('id_receta');
    expect(data.nombre_receta).toBe(sampleReceta.nombreReceta);
    createdRecetaId = data.id_receta;
  });

  test('getAll returns the created receta', async () => {
    const req = {};
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RecetaController.getAll(req, res);

    const data = res.json.mock.calls[0][0];
    expect(data.some((r) => r.id_receta === createdRecetaId)).toBe(true);
  });

  test('update modifies an existing receta', async () => {
    const updatedName = `RecetaUpdated_${Date.now()}`;
    const req = {
      params: { id: createdRecetaId },
      body: {
        nombreReceta: updatedName,
        descripcionGeneral: 'Actualizada',
        pasosPreparacion: ['Nuevo paso'],
        caloriasAproximadas: 500,
      },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RecetaController.update(req, res);

    const data = res.json.mock.calls[0][0];
    expect(data.nombre_receta).toBe(updatedName);
    expect(parseFloat(data.calorias_aproximadas)).toBe(500);
  });

  test('update returns 404 for non-existent receta', async () => {
    const req = {
      params: { id: 999999 },
      body: {
        nombreReceta: 'No existe',
        descripcionGeneral: 'test',
        pasosPreparacion: [],
        caloriasAproximadas: 100,
      },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RecetaController.update(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('create returns 400 when nombre is empty', async () => {
    const req = {
      body: {
        nombreReceta: '',
        descripcionGeneral: 'test',
        pasosPreparacion: [],
        caloriasAproximadas: 100,
      },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RecetaController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('create returns 400 when ingredientes is not an array', async () => {
    const req = {
      body: {
        nombreReceta: 'Test',
        descripcionGeneral: 'test',
        pasosPreparacion: [],
        caloriasAproximadas: 100,
        ingredientes: 'no-array',
      },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RecetaController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('create with ingredients works', async () => {
    const ingredient = await IngredienteModel.create({
      nombreIngrediente: `IngTest_${Date.now()}`,
      unidad: 'unidad',
    });
    createdIngredientId = ingredient.id_ingrediente;

    const recetaWithIng = {
      nombreReceta: `RecetaConIng_${Date.now()}`,
      descripcionGeneral: 'Con ingredientes',
      pasosPreparacion: ['Paso único'],
      caloriasAproximadas: 200,
      ingredientes: [{ idIngrediente: createdIngredientId, cantidad: 2 }],
    };

    const req = { body: recetaWithIng };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RecetaController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    const data = res.json.mock.calls[0][0];
    expect(data).toHaveProperty('id_receta');

    await pool.query('DELETE FROM Receta WHERE id_receta = $1', [data.id_receta]);
  });

  test('delete removes the receta', async () => {
    const req = { params: { id: createdRecetaId } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RecetaController.delete(req, res);

    expect(res.json).toHaveBeenCalled();

    const verifyRes = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    await RecetaController.update(
      {
        params: { id: createdRecetaId },
        body: {
          nombreReceta: 'x',
          descripcionGeneral: 'x',
          pasosPreparacion: [],
          caloriasAproximadas: 100,
        },
      },
      verifyRes
    );
    expect(verifyRes.status).toHaveBeenCalledWith(404);
    createdRecetaId = null;
  });

  test('delete returns 404 for non-existent receta', async () => {
    const req = { params: { id: 999999 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RecetaController.delete(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
