# Resumen de pruebas (controladores con DB real)

Este documento describe de forma breve qué prueba realiza cada archivo en la carpeta `tests/`.

---

## Pruebas existentes (con mocks / app)

- `app.test.js`
  - Objetivo: comprobar que la aplicación Express expone la ruta raíz `/` y el spec de Swagger `/api/swagger.json`.

- `validation.test.js`
  - Objetivo: verificar utilidades puras de validación en `src/utils/validation.js`.

- `authService.test.js`
  - Objetivo: asegurar la generación y verificación de JWT en `src/services/authService.js`.

- `authMiddleware.test.js`
  - Objetivo: probar `src/middleware/authMiddleware.js` aislando `AuthService`.

## Nuevas pruebas (con conexión real a BD)

Todos los tests a continuación **se conectan a la base de datos real** (Neon PostgreSQL), crean registros, los prueban y los limpian al finalizar.

### Controladores CRUD básicos (sin autenticación)

- `ejercicioController.test.js` (9 tests)
  - CRUD completo de ejercicios: getAll, create, update, delete
  - Validaciones: nombre vacío (400), update/delete de inexistente (404)

- `ingredienteController.test.js` (8 tests)
  - CRUD completo de ingredientes
  - Validaciones: nombre vacío (400), update/delete de inexistente (404)

- `rutinaController.test.js` (9 tests)
  - CRUD completo de rutinas
  - Validaciones: nombre vacío (400), ejercicios no array (400), update/delete de inexistente (404)

- `recetaController.test.js` (10 tests)
  - CRUD completo de recetas
  - Creación con ingredientes
  - Validaciones: nombre vacío (400), ingredientes no array (400), update/delete de inexistente (404)

### Controladores con autenticación (usan req.user)

- `authController.test.js` (12 tests)
  - Registro exitoso, registro duplicado (400), registro con datos inválidos (400)
  - Login correcto, login con contraseña incorrecta (401), login con email inexistente (401), login con email inválido (400)
  - getProfile exitoso, getProfile de usuario inexistente (404)
  - updateProfile exitoso, updateProfile con datos inválidos (400), updateProfile de usuario inexistente (404)

- `metaFisicaController.test.js` (12 tests)
  - CRUD completo de metas físicas (con usuario autenticado)
  - Validaciones: tipo inválido (400), calorías no positivas (400), fechaFin <= fechaInicio (400)
  - Permisos: delete de meta de otro usuario (403)
  - update/delete de inexistente (404)

- `registroActividadFisicaController.test.js` (14 tests)
  - CRUD completo de registros de actividad física
  - getByDate, validaciones de fecha y nivelDeIntensidad
  - addRutina, removeRutina
  - update/delete de inexistente (404)

- `registroIngestaAlimenticiController.test.js` (13 tests)
  - CRUD completo de registros de ingesta
  - getByDate, validaciones de fecha
  - addReceta, removeReceta
  - update/delete de inexistente (404)

- `estadisticasController.test.js` (12 tests)
  - getHistorial, getHistorialByDateRange (con y sin fechas)
  - getEstadisticas (con y sin rango de fechas)
  - createHistorial
  - Validaciones: fechas inválidas, fechaFin < fechaInicio, fechas faltantes

## Totales

- **13 suites** de prueba
- **109 tests** individuales
- **0 fallos**

## Cómo ejecutar

```bash
cd matfi_backend
npm test
```

> **Nota:** Los tests se conectan a la base de datos real. Los registros creados durante las pruebas se eliminan automáticamente al finalizar cada suite.
