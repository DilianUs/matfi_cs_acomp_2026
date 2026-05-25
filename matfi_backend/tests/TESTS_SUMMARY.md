# Resumen de pruebas unitarias

Este documento describe de forma breve qué prueba realiza cada archivo en la carpeta `tests/` y los pasos que siguen internamente.

---

- `app.test.js`
  - Objetivo: comprobar que la aplicación Express expone la ruta raíz `/` y el spec de Swagger `/api/swagger.json`.
  - Pasos:
    1. Importa la app desde `src/app.js` y hace peticiones usando `supertest`.
    2. GET `/` -> espera código 200 y texto que contenga "API de MatFi Backend funcionando".
    3. GET `/api/swagger.json` -> espera código 200, `content-type: application/json` y que el objeto tenga la propiedad `openapi` igual a `3.0.0`.

- `validation.test.js`
  - Objetivo: verificar utilidades puras de validación en `src/utils/validation.js`.
  - Pasos:
    1. Probar `isValidEmail` con emails válidos e inválidos.
    2. Probar `isValidPassword` con cadenas de distinto tamaño y valores nulos.
    3. Probar `isNotEmpty` con valores no vacíos y espacios en blanco.
    4. Probar `isPositiveNumber` con positivos, ceros y negativos.
    5. Probar `isValidDate` con formatos `YYYY-MM-DD` válidos e inválidos.

- `authService.test.js`
  - Objetivo: asegurar la generación y verificación de JWT en `src/services/authService.js`.
  - Pasos:
    1. Fijar `process.env.JWT_SECRET` para la prueba.
    2. Importar dinámicamente `AuthService` y generar un token con un `payload` de ejemplo.
    3. Verificar que `verifyToken` decodifica el token y devuelve el `payload` esperado.
    4. Verificar que `verifyToken` lanza un error si se pasa un token inválido.

- `authMiddleware.test.js`
  - Objetivo: probar `src/middleware/authMiddleware.js` aislando `AuthService`.
  - Estrategia: mockear `AuthService.verifyToken` con `jest.unstable_mockModule`.
  - Pasos:
    1. Caso sin header Authorization -> espera `res.status(401).json({ error: 'Token de autenticación requerido' })`.
    2. Caso token válido -> `verifyToken` devuelve objeto usuario; el middleware añade `req.user` y llama a `next()`.
    3. Caso token inválido -> `verifyToken` lanza y el middleware responde `401` con `Token inválido`.

- `recetaController.test.js`
  - Objetivo: probar la lógica de `src/controllers/recetaController.js` sin tocar la BD.
  - Estrategia: mockear `RecetaModel` (métodos `findAll`, `create`) con `jest.unstable_mockModule`.
  - Pasos:
    1. `getAll`: mockear `findAll` para devolver un arreglo y verificar que `res.json` recibe ese arreglo.
    2. `create`: mockear `create` para devolver la receta creada; verificar que `res.status(201).json(...)` se llame con el objeto.

---

Cómo ejecutar todas las pruebas

1. Situarse en la carpeta del backend:

```bash
cd matfi_backend
```

2. Instalar dependencias (si no están instaladas):

```bash
npm install
```

3. Ejecutar la suite de pruebas:

```bash
npm test
```

Notas
- Las pruebas unitarias usan mocks para evitar accesos reales a la base de datos. Para pruebas de integración (endpoints con DB), se necesitará una base de datos de pruebas o una estrategia de rollback/fixtures.
- Si quieres, puedo añadir un script `npm run test:watch` o un `README.md` más extenso con evidencias (capturas/outputs). 
