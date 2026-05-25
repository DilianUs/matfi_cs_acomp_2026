import { jest } from '@jest/globals';

const mockVerify = jest.fn();

jest.unstable_mockModule('../src/services/authService.js', () => ({
  default: {
    verifyToken: mockVerify
  }
}));

let authMiddleware;

beforeAll(async () => {
  ({ default: authMiddleware } = await import('../src/middleware/authMiddleware.js'));
});

beforeEach(() => {
  mockVerify.mockReset();
});

test('responds 401 when Authorization header is missing', () => {
  const req = { headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();

  authMiddleware(req, res, next);

  expect(res.status).toHaveBeenCalledWith(401);
  expect(res.json).toHaveBeenCalledWith({ error: 'Token de autenticación requerido' });
  expect(next).not.toHaveBeenCalled();
});

test('calls next and attaches user when token is valid', () => {
  mockVerify.mockReturnValue({ idUsuario: 1 });

  const req = { headers: { authorization: 'Bearer valid.token' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();

  authMiddleware(req, res, next);

  expect(mockVerify).toHaveBeenCalledWith('valid.token');
  expect(req.user).toEqual({ idUsuario: 1 });
  expect(next).toHaveBeenCalled();
});

test('responds 401 when token is invalid', () => {
  mockVerify.mockImplementation(() => { throw new Error('Token inválido'); });

  const req = { headers: { authorization: 'Bearer bad.token' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();

  authMiddleware(req, res, next);

  expect(res.status).toHaveBeenCalledWith(401);
  expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido' });
  expect(next).not.toHaveBeenCalled();
});
