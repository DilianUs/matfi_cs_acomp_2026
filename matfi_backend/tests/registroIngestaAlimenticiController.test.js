import { jest } from '@jest/globals';
import RegistroIngestaAlimenticiController from '../src/controllers/registroIngestaAlimenticiController.js';
import UserModel from '../src/models/userModel.js';
import pool from '../src/config/database.js';

const testEmail = `reg_ing_test_${Date.now()}@test.com`;
let createdUserId = null;
let createdRegistroId = null;
let createdRecetaId = null;

beforeAll(async () => {
  const newUser = await UserModel.create({
    nombreUsuario: 'RegIngTest',
    edadUsuario: 25,
    generoUsuario: 'femenino',
    estaturaUsuario: 1.6,
    pesoUsuario: 55,
    correoUsuario: testEmail,
    contraseniaUsuario: 'password12345',
  });
  createdUserId = newUser.idUsuario;
});

afterAll(async () => {
  if (createdRecetaId) {
    await pool.query('DELETE FROM Receta WHERE id_receta = $1', [createdRecetaId]);
  }
  if (createdUserId) {
    await pool.query('DELETE FROM CuentaDeUsuario WHERE id_usuario = $1', [createdUserId]);
    await pool.query('DELETE FROM Usuario WHERE id_usuario = $1', [createdUserId]);
  }
});

describe('RegistroIngestaAlimenticiController', () => {
  test('getAll returns empty array initially', async () => {
    const req = { user: { idUsuario: createdUserId } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RegistroIngestaAlimenticiController.getAll(req, res);

    expect(res.json).toHaveBeenCalled();
    const data = res.json.mock.calls[0][0];
    expect(Array.isArray(data)).toBe(true);
  });

  test('create creates a new registro with 0 calorias by default', async () => {
    const req = { user: { idUsuario: createdUserId }, body: { fecha: '2026-05-28' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RegistroIngestaAlimenticiController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    const data = res.json.mock.calls[0][0];
    expect(data.registro).toHaveProperty('id_registro_ingesta');
    expect(parseInt(data.registro.calorias_totales_consumidas)).toBe(0);
    createdRegistroId = data.registro.id_registro_ingesta;
  });

  test('create with caloriasConsumidas works', async () => {
    const req = {
      user: { idUsuario: createdUserId },
      body: { fecha: '2026-05-29', caloriasConsumidas: 500 },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RegistroIngestaAlimenticiController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    const data = res.json.mock.calls[0][0];
    await pool.query(
      'DELETE FROM RegistroIngestaAlimenticiaDiaria WHERE id_registro_ingesta = $1',
      [data.registro.id_registro_ingesta]
    );
  });

  test('getAll returns the created registro', async () => {
    const req = { user: { idUsuario: createdUserId } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RegistroIngestaAlimenticiController.getAll(req, res);

    const data = res.json.mock.calls[0][0];
    expect(data.some((r) => r.id_registro_ingesta === createdRegistroId)).toBe(true);
  });

  test('getByDate returns registros for a specific date', async () => {
    const req = { user: { idUsuario: createdUserId }, query: { fecha: '2026-05-28' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RegistroIngestaAlimenticiController.getByDate(req, res);

    const data = res.json.mock.calls[0][0];
    expect(Array.isArray(data)).toBe(true);
    expect(data.some((r) => r.id_registro_ingesta === createdRegistroId)).toBe(true);
  });

  test('getByDate returns 400 for invalid date', async () => {
    const req = { user: { idUsuario: createdUserId }, query: { fecha: 'not-a-date' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RegistroIngestaAlimenticiController.getByDate(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('create returns 400 for invalid fecha', async () => {
    const req = { user: { idUsuario: createdUserId }, body: { fecha: 'invalid' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RegistroIngestaAlimenticiController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('update modifies an existing registro', async () => {
    const req = {
      user: { idUsuario: createdUserId },
      params: { id: createdRegistroId },
      body: { caloriasConsumidas: 800 },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RegistroIngestaAlimenticiController.update(req, res);

    const data = res.json.mock.calls[0][0];
    // calorias_totales_consumidas is recalculated by DB trigger based on related recetas (0 if none)
    expect(parseInt(data.registro.calorias_totales_consumidas)).toBe(0);
  });

  test('update returns 404 for non-existent registro', async () => {
    const req = {
      user: { idUsuario: createdUserId },
      params: { id: 999999 },
      body: { caloriasConsumidas: 100 },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RegistroIngestaAlimenticiController.update(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('addReceta adds a receta to the registro', async () => {
    const recetaReq = {
      body: {
        nombreReceta: `RecetaIng_${Date.now()}`,
        descripcionGeneral: 'Test',
        pasosPreparacion: ['Paso'],
        caloriasAproximadas: 300,
      },
    };
    const recetaRes = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const RecetaController = (await import('../src/controllers/recetaController.js')).default;
    await RecetaController.create(recetaReq, recetaRes);
    createdRecetaId = recetaRes.json.mock.calls[0][0].id_receta;

    const req = {
      user: { idUsuario: createdUserId },
      params: { id: createdRegistroId },
      body: { idReceta: createdRecetaId },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RegistroIngestaAlimenticiController.addReceta(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('addReceta returns 400 for missing idReceta', async () => {
    const req = { user: { idUsuario: createdUserId }, params: { id: createdRegistroId }, body: {} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RegistroIngestaAlimenticiController.addReceta(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('removeReceta removes a receta from the registro', async () => {
    const req = {
      user: { idUsuario: createdUserId },
      params: { id: createdRegistroId, idReceta: createdRecetaId },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RegistroIngestaAlimenticiController.removeReceta(req, res);

    expect(res.json).toHaveBeenCalled();
  });

  test('delete removes the registro', async () => {
    const req = { user: { idUsuario: createdUserId }, params: { id: createdRegistroId } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RegistroIngestaAlimenticiController.delete(req, res);

    expect(res.json).toHaveBeenCalled();

    const verifyRes = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    await RegistroIngestaAlimenticiController.update(
      {
        user: { idUsuario: createdUserId },
        params: { id: createdRegistroId },
        body: { caloriasConsumidas: 100 },
      },
      verifyRes
    );
    expect(verifyRes.status).toHaveBeenCalledWith(404);
    createdRegistroId = null;
  });

  test('delete returns 404 for non-existent registro', async () => {
    const req = { user: { idUsuario: createdUserId }, params: { id: 999999 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RegistroIngestaAlimenticiController.delete(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
