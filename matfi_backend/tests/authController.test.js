import { jest } from '@jest/globals';
import AuthController from '../src/controllers/authController.js';
import pool from '../src/config/database.js';

const testEmail = `auth_test_${Date.now()}@test.com`;
const testPassword = 'password12345';
let createdUserId = null;

afterAll(async () => {
  if (createdUserId) {
    await pool.query('DELETE FROM CuentaDeUsuario WHERE id_usuario = $1', [createdUserId]);
    await pool.query('DELETE FROM Usuario WHERE id_usuario = $1', [createdUserId]);
  }
});

describe('AuthController', () => {
  test('register creates a new user', async () => {
    const req = {
      body: {
        nombreUsuario: 'AuthTestUser',
        edadUsuario: 30,
        generoUsuario: 'femenino',
        estaturaUsuario: 1.65,
        pesoUsuario: 60,
        correoUsuario: testEmail,
        contraseniaUsuario: testPassword,
      },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await AuthController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    const data = res.json.mock.calls[0][0];
    expect(data).toHaveProperty('message', 'Usuario registrado exitosamente');
    expect(data).toHaveProperty('token');
    expect(data.user).toHaveProperty('idUsuario');
    expect(data.user.nombreUsuario).toBe('AuthTestUser');
    expect(data.user.correoUsuario).toBe(testEmail);

    createdUserId = data.user.idUsuario;
  });

  test('register returns 400 for duplicate email', async () => {
    const req = {
      body: {
        nombreUsuario: 'Duplicate',
        edadUsuario: 25,
        correoUsuario: testEmail,
        contraseniaUsuario: testPassword,
      },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await AuthController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].error).toContain('ya está registrado');
  });

  test('register returns 400 for invalid data', async () => {
    const req = {
      body: { nombreUsuario: '', correoUsuario: 'invalid-email', contraseniaUsuario: 'short' },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await AuthController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('login with correct credentials', async () => {
    const req = {
      body: { correoUsuario: testEmail, contraseniaUsuario: testPassword },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await AuthController.login(req, res);

    expect(res.json).toHaveBeenCalled();
    const data = res.json.mock.calls[0][0];
    expect(data).toHaveProperty('message', 'Inicio de sesión exitoso');
    expect(data).toHaveProperty('token');
    expect(data.user).toHaveProperty('idUsuario');
  });

  test('login returns 401 for wrong password', async () => {
    const req = {
      body: { correoUsuario: testEmail, contraseniaUsuario: 'wrongpassword' },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await AuthController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('login returns 401 for non-existent email', async () => {
    const req = {
      body: { correoUsuario: 'nonexistent@test.com', contraseniaUsuario: testPassword },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await AuthController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('login returns 400 for invalid email format', async () => {
    const req = {
      body: { correoUsuario: 'invalid', contraseniaUsuario: testPassword },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await AuthController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('getProfile returns user info with valid token', async () => {
    const req = { user: { idUsuario: createdUserId, correo: testEmail } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await AuthController.getProfile(req, res);

    expect(res.json).toHaveBeenCalled();
    const data = res.json.mock.calls[0][0];
    expect(data).toHaveProperty('idUsuario', createdUserId);
    expect(data).toHaveProperty('nombreUsuario', 'AuthTestUser');
    expect(data).toHaveProperty('correoUsuario', testEmail);
  });

  test('getProfile returns 404 for non-existent user', async () => {
    const req = { user: { idUsuario: 999999, correo: 'fake@test.com' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await AuthController.getProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('updateProfile updates user info', async () => {
    const req = {
      user: { idUsuario: createdUserId, correo: testEmail },
      body: { nombreUsuario: 'UpdatedName', edadUsuario: 28, generoUsuario: 'masculino' },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await AuthController.updateProfile(req, res);

    expect(res.json).toHaveBeenCalled();
    const data = res.json.mock.calls[0][0];
    expect(data.message).toBe('Perfil actualizado exitosamente');
    expect(data.user.nombreUsuario).toBe('UpdatedName');
    expect(data.user.edadUsuario).toBe(28);
  });

  test('updateProfile returns 400 for invalid data', async () => {
    const req = {
      user: { idUsuario: createdUserId, correo: testEmail },
      body: { edadUsuario: -5 },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await AuthController.updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('updateProfile returns 404 for non-existent user', async () => {
    const req = {
      user: { idUsuario: 999999, correo: 'fake@test.com' },
      body: { nombreUsuario: 'NoExiste' },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await AuthController.updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
