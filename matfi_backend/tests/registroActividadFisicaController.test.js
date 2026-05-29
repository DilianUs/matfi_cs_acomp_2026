import { jest } from '@jest/globals';
import RegistroActividadFisicaController from '../src/controllers/registroActividadFisicaController.js';
import UserModel from '../src/models/userModel.js';
import RutinaModel from '../src/models/rutinaModel.js';
import pool from '../src/config/database.js';

const testEmail = `reg_act_test_${Date.now()}@test.com`;
let createdUserId = null;
let createdRegistroId = null;
let createdRutinaId = null;

beforeAll(async () => {
  const newUser = await UserModel.create({
    nombreUsuario: 'RegActTest',
    edadUsuario: 28,
    generoUsuario: 'masculino',
    estaturaUsuario: 1.8,
    pesoUsuario: 80,
    correoUsuario: testEmail,
    contraseniaUsuario: 'password12345',
  });
  createdUserId = newUser.idUsuario;
});

afterAll(async () => {
  if (createdRutinaId) {
    await pool.query('DELETE FROM Rutina WHERE id_rutina = $1', [createdRutinaId]);
  }
  if (createdUserId) {
    await pool.query('DELETE FROM CuentaDeUsuario WHERE id_usuario = $1', [createdUserId]);
    await pool.query('DELETE FROM Usuario WHERE id_usuario = $1', [createdUserId]);
  }
});

describe('RegistroActividadFisicaController', () => {
  test('getAll returns empty array initially', async () => {
    const req = { user: { idUsuario: createdUserId } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RegistroActividadFisicaController.getAll(req, res);

    expect(res.json).toHaveBeenCalled();
    const data = res.json.mock.calls[0][0];
    expect(Array.isArray(data)).toBe(true);
  });

  test('create creates a new registro', async () => {
    const req = {
      user: { idUsuario: createdUserId },
      body: {
        fecha: '2026-05-28',
        caloriasQuemadas: 300,
        tiempoInvertido: 45,
        nivelDeIntensidad: 'media',
      },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RegistroActividadFisicaController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    const data = res.json.mock.calls[0][0];
    expect(data.registro).toHaveProperty('id_registro_actividad');
    expect(parseInt(data.registro.calorias_quemadas)).toBe(300);
    createdRegistroId = data.registro.id_registro_actividad;
  });

  test('getAll returns the created registro', async () => {
    const req = { user: { idUsuario: createdUserId } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RegistroActividadFisicaController.getAll(req, res);

    const data = res.json.mock.calls[0][0];
    expect(data.some((r) => r.id_registro_actividad === createdRegistroId)).toBe(true);
  });

  test('getByDate returns registros for a specific date', async () => {
    const req = { user: { idUsuario: createdUserId }, query: { fecha: '2026-05-28' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RegistroActividadFisicaController.getByDate(req, res);

    const data = res.json.mock.calls[0][0];
    expect(Array.isArray(data)).toBe(true);
    expect(data.some((r) => r.id_registro_actividad === createdRegistroId)).toBe(true);
  });

  test('getByDate returns 400 for invalid date', async () => {
    const req = { user: { idUsuario: createdUserId }, query: { fecha: 'not-a-date' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RegistroActividadFisicaController.getByDate(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('create returns 400 for invalid fecha', async () => {
    const req = {
      user: { idUsuario: createdUserId },
      body: { fecha: 'invalid', caloriasQuemadas: 300 },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RegistroActividadFisicaController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('create returns 400 for invalid nivelDeIntensidad', async () => {
    const req = {
      user: { idUsuario: createdUserId },
      body: {
        fecha: '2026-05-28',
        caloriasQuemadas: 300,
        tiempoInvertido: 45,
        nivelDeIntensidad: 'extremo',
      },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RegistroActividadFisicaController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('update modifies an existing registro', async () => {
    const req = {
      user: { idUsuario: createdUserId },
      params: { id: createdRegistroId },
      body: { caloriasQuemadas: 500, tiempoInvertido: 60, nivelDeIntensidad: 'alta' },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RegistroActividadFisicaController.update(req, res);

    const data = res.json.mock.calls[0][0];
    // calorias_quemadas is recalculated by DB trigger based on related ejercicios (0 if none)
    expect(parseInt(data.registro.calorias_quemadas)).toBe(0);
    expect(data.registro.nivel_de_intensidad).toBe('alta');
    expect(parseFloat(data.registro.tiempo_invertido)).toBe(60);
  });

  test('update returns 404 for non-existent registro', async () => {
    const req = {
      user: { idUsuario: createdUserId },
      params: { id: 999999 },
      body: { caloriasQuemadas: 100 },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RegistroActividadFisicaController.update(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('addRutina adds a rutina to the registro', async () => {
    const rutina = await RutinaModel.create({
      nombreRutina: `RutinaAct_${Date.now()}`,
      descripcionRutina: 'Test',
    });
    createdRutinaId = rutina.id_rutina;

    const req = {
      user: { idUsuario: createdUserId },
      params: { id: createdRegistroId },
      body: { idRutina: createdRutinaId },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RegistroActividadFisicaController.addRutina(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('addRutina returns 400 for missing idRutina', async () => {
    const req = { user: { idUsuario: createdUserId }, params: { id: createdRegistroId }, body: {} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RegistroActividadFisicaController.addRutina(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('removeRutina removes a rutina from the registro', async () => {
    const req = {
      user: { idUsuario: createdUserId },
      params: { id: createdRegistroId, idRutina: createdRutinaId },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RegistroActividadFisicaController.removeRutina(req, res);

    expect(res.json).toHaveBeenCalled();
  });

  test('delete removes the registro', async () => {
    const req = { user: { idUsuario: createdUserId }, params: { id: createdRegistroId } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RegistroActividadFisicaController.delete(req, res);

    expect(res.json).toHaveBeenCalled();

    const verifyRes = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    await RegistroActividadFisicaController.update(
      {
        user: { idUsuario: createdUserId },
        params: { id: createdRegistroId },
        body: { caloriasQuemadas: 100 },
      },
      verifyRes
    );
    expect(verifyRes.status).toHaveBeenCalledWith(404);
    createdRegistroId = null;
  });

  test('delete returns 404 for non-existent registro', async () => {
    const req = { user: { idUsuario: createdUserId }, params: { id: 999999 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await RegistroActividadFisicaController.delete(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
