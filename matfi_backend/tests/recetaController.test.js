import { jest } from '@jest/globals';

const mockFindAll = jest.fn();
const mockCreate = jest.fn();

jest.unstable_mockModule('../src/models/recetaModel.js', () => ({
  default: {
    findAll: mockFindAll,
    create: mockCreate
  }
}));

let RecetaController;

beforeAll(async () => {
  ({ default: RecetaController } = await import('../src/controllers/recetaController.js'));
});

beforeEach(() => {
  mockFindAll.mockReset();
  mockCreate.mockReset();
});

test('getAll returns receta list', async () => {
  mockFindAll.mockResolvedValue([{ id_receta: 1, nombre_receta: 'Ensalada' }]);

  const req = {};
  const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

  await RecetaController.getAll(req, res);

  expect(res.json).toHaveBeenCalledWith([{ id_receta: 1, nombre_receta: 'Ensalada' }]);
});

test('create validates and returns 201 on success', async () => {
  const nueva = { id_receta: 2, nombre_receta: 'Sopa' };
  mockCreate.mockResolvedValue(nueva);

  const req = { body: { nombreReceta: 'Sopa', pasosPreparacion: [], ingredientes: [] } };
  const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

  await RecetaController.create(req, res);

  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith(nueva);
});
