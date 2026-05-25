let AuthService;

beforeAll(async () => {
  // Establecer secreto de prueba antes de importar el módulo (evitar lectura previa de .env)
  process.env.JWT_SECRET = 'test-jwt-secret';
  AuthService = (await import('../src/services/authService.js')).default;
});

describe('AuthService', () => {
  test('generateToken and verifyToken work together', () => {
    const payload = { idUsuario: 123, correoUsuario: 'a@b.com' };
    const token = AuthService.generateToken(payload);
    expect(typeof token).toBe('string');

    const decoded = AuthService.verifyToken(token);
    expect(decoded).toHaveProperty('idUsuario', 123);
    expect(decoded).toHaveProperty('correoUsuario', 'a@b.com');
  });

  test('verifyToken throws for invalid token', () => {
    expect(() => AuthService.verifyToken('bad.token.here')).toThrow();
  });
});
