import request from 'supertest';
import app from '../src/app.js';

describe('MatFi backend basic endpoints', () => {
  test('GET / should return welcome text', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/API de MatFi Backend funcionando/);
  });

  test('GET /api/swagger.json should return JSON with openapi field', async () => {
    const res = await request(app).get('/api/swagger.json');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body).toHaveProperty('openapi');
    expect(res.body.openapi).toBe('3.0.0');
  });
});
