import { jest } from '@jest/globals';
import EstadisticasController from '../src/controllers/estadisticasController.js';
import UserModel from '../src/models/userModel.js';
import pool from '../src/config/database.js';

const testEmail = `estad_test_${Date.now()}@test.com`;
let createdUserId = null;
let createdRegistroActividadId = null;
let createdRegistroIngestaId = null;

beforeAll(async () => {
  const newUser = await UserModel.create({
    nombreUsuario: 'EstadTest',
    edadUsuario: 30,
    generoUsuario: 'masculino',
    estaturaUsuario: 1.75,
    pesoUsuario: 72,
    correoUsuario: testEmail,
    contraseniaUsuario: 'password12345',
  });
  createdUserId = newUser.idUsuario;

  const actResult = await pool.query(
    `INSERT INTO RegistroActividadFisicaDiaria (id_usuario, fecha, calorias_quemadas, tiempo_invertido, nivel_de_intensidad)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id_registro_actividad`,
    [createdUserId, '2026-05-28', 300, 45, 'media']
  );
  createdRegistroActividadId = actResult.rows[0].id_registro_actividad;

  const ingResult = await pool.query(
    `INSERT INTO RegistroIngestaAlimenticiaDiaria (id_usuario, fecha, calorias_totales_consumidas)
     VALUES ($1, $2, $3)
     RETURNING id_registro_ingesta`,
    [createdUserId, '2026-05-28', 1500]
  );
  createdRegistroIngestaId = ingResult.rows[0].id_registro_ingesta;
});

afterAll(async () => {
  if (createdRegistroActividadId) {
    await pool.query('DELETE FROM RegistroActividadFisicaDiaria WHERE id_registro_actividad = $1', [
      createdRegistroActividadId,
    ]);
  }
  if (createdRegistroIngestaId) {
    await pool.query(
      'DELETE FROM RegistroIngestaAlimenticiaDiaria WHERE id_registro_ingesta = $1',
      [createdRegistroIngestaId]
    );
  }
  if (createdUserId) {
    await pool.query('DELETE FROM CuentaDeUsuario WHERE id_usuario = $1', [createdUserId]);
    await pool.query('DELETE FROM Usuario WHERE id_usuario = $1', [createdUserId]);
  }
});

describe('EstadisticasController', () => {
  test('getHistorial returns historial for the user', async () => {
    const req = { user: { idUsuario: createdUserId } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await EstadisticasController.getHistorial(req, res);

    expect(res.json).toHaveBeenCalled();
    const data = res.json.mock.calls[0][0];
    expect(Array.isArray(data)).toBe(true);
  });

  test('getHistorialByDateRange returns historial within date range', async () => {
    const req = {
      user: { idUsuario: createdUserId },
      query: { fechaInicio: '2026-05-01', fechaFin: '2026-05-31' },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await EstadisticasController.getHistorialByDateRange(req, res);

    expect(res.json).toHaveBeenCalled();
    const data = res.json.mock.calls[0][0];
    expect(Array.isArray(data)).toBe(true);
  });

  test('getHistorialByDateRange returns 400 for invalid dates', async () => {
    const req = {
      user: { idUsuario: createdUserId },
      query: { fechaInicio: 'invalid', fechaFin: '2026-05-31' },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await EstadisticasController.getHistorialByDateRange(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('getHistorialByDateRange returns 400 when fechaFin < fechaInicio', async () => {
    const req = {
      user: { idUsuario: createdUserId },
      query: { fechaInicio: '2026-06-01', fechaFin: '2026-05-01' },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await EstadisticasController.getHistorialByDateRange(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('getHistorialByDateRange returns 400 when fechaInicio is missing', async () => {
    const req = { user: { idUsuario: createdUserId }, query: { fechaFin: '2026-05-31' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await EstadisticasController.getHistorialByDateRange(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('getEstadisticas returns statistics', async () => {
    const req = { user: { idUsuario: createdUserId }, query: {} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await EstadisticasController.getEstadisticas(req, res);

    expect(res.json).toHaveBeenCalled();
    const data = res.json.mock.calls[0][0];
    expect(data).toHaveProperty('totalRegistrosActividad');
    expect(data).toHaveProperty('caloriasQuemadasTotal');
    expect(data).toHaveProperty('totalRegistrosIngesta');
    expect(data).toHaveProperty('caloriasConsumidastotal');
    expect(data).toHaveProperty('balanceCalorias');
  });

  test('getEstadisticas with date range returns filtered statistics', async () => {
    const req = {
      user: { idUsuario: createdUserId },
      query: { fechaInicio: '2026-05-01', fechaFin: '2026-05-31' },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await EstadisticasController.getEstadisticas(req, res);

    expect(res.json).toHaveBeenCalled();
    const data = res.json.mock.calls[0][0];
    expect(data.totalRegistrosActividad).toBeGreaterThanOrEqual(1);
    expect(data.caloriasQuemadasTotal).toBeGreaterThanOrEqual(300);
  });

  test('getEstadisticas returns 400 for invalid dates', async () => {
    const req = {
      user: { idUsuario: createdUserId },
      query: { fechaInicio: 'invalid', fechaFin: '2026-05-31' },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await EstadisticasController.getEstadisticas(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('createHistorial creates a new historial entry', async () => {
    const req = {
      user: { idUsuario: createdUserId },
      body: {
        fecha: '2026-05-28',
        idRegistroActividad: createdRegistroActividadId,
        idRegistroIngesta: createdRegistroIngestaId,
      },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await EstadisticasController.createHistorial(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    const data = res.json.mock.calls[0][0];
    expect(data.historial).toHaveProperty('id_historial');

    await pool.query('DELETE FROM HistorialIntegral WHERE id_historial = $1', [
      data.historial.id_historial,
    ]);
  });

  test('createHistorial returns 400 for missing fecha', async () => {
    const req = {
      user: { idUsuario: createdUserId },
      body: { idRegistroActividad: createdRegistroActividadId },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await EstadisticasController.createHistorial(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('createHistorial returns 400 for no registro ids', async () => {
    const req = { user: { idUsuario: createdUserId }, body: { fecha: '2026-05-28' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await EstadisticasController.createHistorial(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});
