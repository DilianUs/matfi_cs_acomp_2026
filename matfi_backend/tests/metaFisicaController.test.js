import { jest } from '@jest/globals';
import MetaFisicaController from '../src/controllers/metaFisicaController.js';
import UserModel from '../src/models/userModel.js';
import pool from '../src/config/database.js';

const testEmail = `metafisica_test_${Date.now()}@test.com`;
let createdUserId = null;
let createdMetaId = null;

beforeAll(async () => {
  const newUser = await UserModel.create({
    nombreUsuario: 'MetaFisicaTest',
    edadUsuario: 30,
    generoUsuario: 'masculino',
    estaturaUsuario: 1.7,
    pesoUsuario: 75,
    correoUsuario: testEmail,
    contraseniaUsuario: 'password12345',
  });
  createdUserId = newUser.idUsuario;
});

afterAll(async () => {
  if (createdMetaId) {
    await pool.query('DELETE FROM MetaFisica WHERE id_meta = $1', [createdMetaId]);
  }
  if (createdUserId) {
    await pool.query('DELETE FROM CuentaDeUsuario WHERE id_usuario = $1', [createdUserId]);
    await pool.query('DELETE FROM Usuario WHERE id_usuario = $1', [createdUserId]);
  }
});

describe('MetaFisicaController', () => {
  test('getAll returns empty array initially', async () => {
    const req = { user: { idUsuario: createdUserId } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await MetaFisicaController.getAll(req, res);

    expect(res.json).toHaveBeenCalled();
    const data = res.json.mock.calls[0][0];
    expect(Array.isArray(data)).toBe(true);
  });

  test('create creates a new meta', async () => {
    const req = {
      user: { idUsuario: createdUserId },
      body: {
        tipoDeMetaFisica: 'perdida',
        caloriasObjetivo: 2000,
        fechaInicio: '2026-01-01',
        fechaFin: '2026-06-30',
      },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await MetaFisicaController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    const data = res.json.mock.calls[0][0];
    expect(data.meta).toHaveProperty('id_meta');
    expect(data.meta.tipo_de_meta).toBe('perdida');
    createdMetaId = data.meta.id_meta;
  });

  test('getAll returns the created meta', async () => {
    const req = { user: { idUsuario: createdUserId } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await MetaFisicaController.getAll(req, res);

    const data = res.json.mock.calls[0][0];
    expect(data.some((m) => m.id_meta === createdMetaId)).toBe(true);
  });

  test('create returns 400 for invalid tipo', async () => {
    const req = {
      user: { idUsuario: createdUserId },
      body: {
        tipoDeMetaFisica: 'invalido',
        caloriasObjetivo: 2000,
        fechaInicio: '2026-01-01',
        fechaFin: '2026-06-30',
      },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await MetaFisicaController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('create returns 400 for non-positive calorias', async () => {
    const req = {
      user: { idUsuario: createdUserId },
      body: {
        tipoDeMetaFisica: 'perdida',
        caloriasObjetivo: -100,
        fechaInicio: '2026-01-01',
        fechaFin: '2026-06-30',
      },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await MetaFisicaController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('create returns 400 when fechaFin <= fechaInicio', async () => {
    const req = {
      user: { idUsuario: createdUserId },
      body: {
        tipoDeMetaFisica: 'perdida',
        caloriasObjetivo: 2000,
        fechaInicio: '2026-06-30',
        fechaFin: '2026-06-30',
      },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await MetaFisicaController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('update modifies an existing meta', async () => {
    const req = {
      user: { idUsuario: createdUserId },
      params: { id: createdMetaId },
      body: { tipoDeMetaFisica: 'ganancia', caloriasObjetivo: 2500 },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await MetaFisicaController.update(req, res);

    const data = res.json.mock.calls[0][0];
    expect(data.meta.tipo_de_meta).toBe('ganancia');
    expect(parseFloat(data.meta.calorias_objetivo)).toBe(2500);
  });

  test('update returns 404 for non-existent meta', async () => {
    const req = {
      user: { idUsuario: createdUserId },
      params: { id: 999999 },
      body: { tipoDeMetaFisica: 'perdida' },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await MetaFisicaController.update(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('delete removes the meta', async () => {
    const req = { user: { idUsuario: createdUserId }, params: { id: createdMetaId } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await MetaFisicaController.delete(req, res);

    expect(res.json).toHaveBeenCalled();
    createdMetaId = null;
  });

  test('delete returns 404 for non-existent meta', async () => {
    const req = { user: { idUsuario: createdUserId }, params: { id: 999999 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await MetaFisicaController.delete(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("delete returns 403 for another user's meta", async () => {
    const createReq = {
      user: { idUsuario: createdUserId },
      body: {
        tipoDeMetaFisica: 'mantenimiento',
        caloriasObjetivo: 1800,
        fechaInicio: '2026-02-01',
        fechaFin: '2026-08-31',
      },
    };
    const createRes = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    await MetaFisicaController.create(createReq, createRes);
    const tempMetaId = createRes.json.mock.calls[0][0].meta.id_meta;

    const deleteReq = { user: { idUsuario: 999999 }, params: { id: tempMetaId } };
    const deleteRes = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    await MetaFisicaController.delete(deleteReq, deleteRes);

    expect(deleteRes.status).toHaveBeenCalledWith(403);

    await pool.query('DELETE FROM MetaFisica WHERE id_meta = $1', [tempMetaId]);
  });
});
