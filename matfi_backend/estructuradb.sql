-- ==========================================
-- 1. CREACIÓN DE TIPOS ENUM
-- ==========================================
CREATE TYPE tipo_meta AS ENUM ('perdida', 'ganancia', 'mantenimiento');
CREATE TYPE nivel_intensidad AS ENUM ('baja', 'media', 'alta');

-- ==========================================
-- 2. TABLAS INDEPENDIENTES
-- ==========================================

CREATE TABLE Usuario (
    id_usuario SERIAL PRIMARY KEY,
    nombre_usuario VARCHAR(100) NOT NULL,
    edad_usuario INT,
    genero_usuario VARCHAR(20),
    estatura_usuario FLOAT,
    peso_usuario FLOAT
);

CREATE TABLE Rutina (
    id_rutina SERIAL PRIMARY KEY,
    nombre_rutina VARCHAR(100) NOT NULL,
    descripcion_rutina TEXT,
    imagen_musculos_trabajados VARCHAR(255)
);

CREATE TABLE Ejercicio (
    id_ejercicio SERIAL PRIMARY KEY,
    nombre_ejercicio VARCHAR(100) NOT NULL,
    cantidad_series INT,
    cantidad_repeticiones INT,
    descripcion_ejercicio TEXT,
    video_ejercicio VARCHAR(255)
);

CREATE TABLE Receta (
    id_receta SERIAL PRIMARY KEY,
    nombre_receta VARCHAR(150) NOT NULL,
    imagen_alusiva VARCHAR(255),
    descripcion_general TEXT,
    pasos_preparacion TEXT,
    calorias_aproximadas FLOAT
);

CREATE TABLE Ingrediente (
    id_ingrediente SERIAL PRIMARY KEY,
    nombre_ingrediente VARCHAR(100) NOT NULL,
    unidad VARCHAR(30)
);

-- ==========================================
-- 3. TABLAS CON RELACIONES 1:1 y 1:N
-- ==========================================

CREATE TABLE CuentaDeUsuario (
    id_cuenta SERIAL PRIMARY KEY,
    correo_usuario VARCHAR(150) UNIQUE NOT NULL,
    contrasenia_usuario VARCHAR(255) NOT NULL,
    id_usuario INT UNIQUE REFERENCES Usuario(id_usuario) ON DELETE CASCADE
);

CREATE TABLE MetaFisica (
    id_meta SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
    tipo_de_meta tipo_meta,
    calorias_objetivo FLOAT,
    fecha_inicio DATE,
    fecha_fin DATE
);

CREATE TABLE RegistroActividadFisicaDiaria (
    id_registro_actividad SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    calorias_quemadas INT,
    tiempo_invertido FLOAT,
    nivel_de_intensidad nivel_intensidad
);

CREATE TABLE RegistroIngestaAlimenticiaDiaria (
    id_registro_ingesta SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    calorias_totales_consumidas INT
);

-- ==========================================
-- 4. TABLAS INTERMEDIAS (RELACIONES N:M)
-- ==========================================

CREATE TABLE RutinaEjercicio (
    id_rutina_ejercicio SERIAL PRIMARY KEY,
    id_rutina INT REFERENCES Rutina(id_rutina) ON DELETE CASCADE,
    id_ejercicio INT REFERENCES Ejercicio(id_ejercicio) ON DELETE CASCADE,
    orden INT
);

CREATE TABLE RecetaIngrediente (
    id_receta_ingrediente SERIAL PRIMARY KEY,
    id_receta INT REFERENCES Receta(id_receta) ON DELETE CASCADE,
    id_ingrediente INT REFERENCES Ingrediente(id_ingrediente) ON DELETE CASCADE,
    cantidad FLOAT
);

CREATE TABLE RegistroActividadRutina (
    id SERIAL PRIMARY KEY,
    id_registro_actividad INT REFERENCES RegistroActividadFisicaDiaria(id_registro_actividad) ON DELETE CASCADE,
    id_rutina INT REFERENCES Rutina(id_rutina) ON DELETE CASCADE
);

CREATE TABLE RegistroIngestaReceta (
    id SERIAL PRIMARY KEY,
    id_registro_ingesta INT REFERENCES RegistroIngestaAlimenticiaDiaria(id_registro_ingesta) ON DELETE CASCADE,
    id_receta INT REFERENCES Receta(id_receta) ON DELETE CASCADE
);

-- ==========================================
-- 5. HISTORIAL INTEGRAL
-- ==========================================

CREATE TABLE HistorialIntegral (
    id_historial SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    id_registro_actividad INT REFERENCES RegistroActividadFisicaDiaria(id_registro_actividad),
    id_registro_ingesta INT REFERENCES RegistroIngestaAlimenticiaDiaria(id_registro_ingesta)
);