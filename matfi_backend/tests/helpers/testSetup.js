import pool from '../../src/config/database.js';
import UserModel from '../../src/models/userModel.js';

const TEST_USER_BASE = {
  nombreUsuario: 'TestUser',
  edadUsuario: 25,
  generoUsuario: 'masculino',
  estaturaUsuario: 1.75,
  pesoUsuario: 70,
};

const testSuffix = Date.now();

export const TEST_USER = {
  ...TEST_USER_BASE,
  correoUsuario: `testuser_${testSuffix}@test.com`,
  contraseniaUsuario: 'password1234',
};

let createdUserId = null;
let createdAccountId = null;

// Crea un usuario de prueba en la BD y devuelve sus IDs
export async function createTestUser() {
  const newUser = await UserModel.create(TEST_USER);
  createdUserId = newUser.idUsuario;
  createdAccountId = newUser.idCuenta;
  return { idUsuario: createdUserId, idCuenta: createdAccountId };
}

// Limpia el usuario de prueba y cualquier registro asociado
export async function cleanTestUser() {
  if (createdUserId) {
    await pool.query('DELETE FROM CuentaDeUsuario WHERE id_usuario = $1', [createdUserId]);
    await pool.query('DELETE FROM Usuario WHERE id_usuario = $1', [createdUserId]);
    createdUserId = null;
    createdAccountId = null;
  }
}

// Obtiene los IDs del usuario creado (debe llamarse después de createTestUser)
export function getTestUserIds() {
  return { idUsuario: createdUserId, idCuenta: createdAccountId };
}

// Helper para crear un req mock básico con usuario autenticado
export function makeAuthenticatedReq(extra = {}) {
  return {
    user: {
      idUsuario: createdUserId,
      correo: TEST_USER.correoUsuario,
      idCuenta: createdAccountId,
    },
    ...extra,
  };
}

// Helper para crear un res mock estándar
export function makeMockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}
