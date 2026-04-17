# MatFi Backend API

API REST para la aplicación MatFi, desarrollada con Node.js, Express.js y PostgreSQL.

## Tecnologías

- **Node.js** (versión 18.x LTS o superior)
- **Express.js** 5.x
- **PostgreSQL** (Neon)
- **JWT** para autenticación
- **bcryptjs** para encriptación de contraseñas

## Estructura del Proyecto

```
matfi_backend/
├── src/
│   ├── controllers/     # Lógica de negocio
│   ├── models/         # Acceso a datos
│   ├── routes/         # Definición de endpoints
│   ├── middleware/     # Funciones intermedias
│   ├── services/       # Servicios auxiliares
│   ├── config/         # Configuraciones
│   └── utils/          # Utilidades
├── index.js            # Punto de entrada
├── package.json
├── .env                # Variables de entorno
├── estructuradb.sql    # Esquema de base de datos
└── README.md
```

## Instalación

1. Clona el repositorio
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura las variables de entorno en `.env`:
   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   JWT_SECRET=your-super-secret-jwt-key
   PORT=3000
   ```
4. Ejecuta el servidor:
   ```bash
   npm run dev
   ```

## Endpoints de Autenticación

### Registro de Usuario
- **POST** `/api/auth/register`
- **Body**:
  ```json
  {
    "nombreUsuario": "Juan Pérez",
    "edadUsuario": 25,
    "generoUsuario": "masculino",
    "estaturaUsuario": 175.5,
    "pesoUsuario": 70.0,
    "correoUsuario": "juan@example.com",
    "contraseniaUsuario": "password123"
  }
  ```

### Inicio de Sesión
- **POST** `/api/auth/login`
- **Body**:
  ```json
  {
    "correoUsuario": "juan@example.com",
    "contraseniaUsuario": "password123"
  }
  ```

### Obtener Perfil
- **GET** `/api/auth/profile`
- **Headers**: `Authorization: Bearer <token>`

## Estándares de Codificación

- **Módulos**: ES Modules
- **Nomenclatura**: camelCase para variables/funciones, kebab-case para archivos
- **Autenticación**: JWT con expiración de 24 horas
- **Encriptación**: bcrypt con salt rounds de 10
- **Respuestas**: JSON exclusivamente
- **Códigos HTTP**: Seguir estándares REST

## Base de Datos

El esquema de la base de datos se encuentra en `estructuradb.sql`. Utiliza PostgreSQL con las siguientes tablas principales:

- `Usuario`: Información básica del usuario
- `CuentaDeUsuario`: Credenciales de acceso
- `MetaFisica`: Metas físicas
- `Rutina`, `Ejercicio`: Catálogo de rutinas y ejercicios
- `Receta`, `Ingrediente`: Catálogo de recetas
- Tablas intermedias para relaciones N:M

## Desarrollo

Para desarrollo, utiliza:
```bash
npm run dev
```

El servidor se reiniciará automáticamente con cambios gracias a nodemon.