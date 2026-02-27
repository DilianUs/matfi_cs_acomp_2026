-- ==========================================================
-- 1. TABLAS INDEPENDIENTES (Maestras)
-- ==========================================================

-- Tabla de Niveles de Entrenamiento
CREATE TABLE nivel_entrenamiento (
    id_nivel SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT,
    orden INT
);

-- Tabla de Categorías de Recetas
CREATE TABLE categoria_receta (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT
);

-- Tabla de Usuarios
CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    contraseña VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_sesion TIMESTAMP
);

-- Tabla de Ejercicios
CREATE TABLE ejercicio (
    id_ejercicio SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion_ejecucion TEXT NOT NULL,
    series INT,
    repeticiones VARCHAR(50),
    tiempo_descanso INT,
    musculos_principales TEXT,
    musculos_secundarios TEXT,
    video_url VARCHAR(255),
    imagen_url VARCHAR(255),
    dificultad VARCHAR(10) CHECK (dificultad IN ('bajo', 'medio', 'alto'))
);

-- ==========================================================
-- 2. TABLAS CON DEPENDENCIAS SIMPLES
-- ==========================================================

-- Tabla de Rutinas (Depende de Nivel)
CREATE TABLE rutina (
    id_rutina SERIAL PRIMARY KEY,
    id_nivel INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    duracion_estimada INT,
    grupos_musculares TEXT,
    objetivo VARCHAR(100),
    imagen_url VARCHAR(255),
    CONSTRAINT fk_rutina_nivel FOREIGN KEY (id_nivel) REFERENCES nivel_entrenamiento(id_nivel)
);

-- Tabla de Recetas (Depende de Categoría)
CREATE TABLE receta (
    id_receta SERIAL PRIMARY KEY,
    id_categoria INT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    imagen_url VARCHAR(255),
    ingredientes TEXT NOT NULL,
    preparacion TEXT NOT NULL,
    proteinas DECIMAL(5,2),
    carbohidratos DECIMAL(5,2),
    grasas DECIMAL(5,2),
    calorias_totales INT,
    tiempo_preparacion INT,
    CONSTRAINT fk_receta_categoria FOREIGN KEY (id_categoria) REFERENCES categoria_receta(id_categoria)
);

-- Tabla de Registros de Agua (Depende de Usuario)
CREATE TABLE registro_agua (
    id_registro_agua SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    fecha DATE NOT NULL,
    cantidad_ml INT DEFAULT 0,
    objetivo_diario INT DEFAULT 2000,
    CONSTRAINT fk_agua_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    CONSTRAINT uk_usuario_fecha_agua UNIQUE (id_usuario, fecha)
);

-- Tabla de Objetivos (Depende de Usuario)
CREATE TABLE objetivo (
    id_objetivo SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    tipo VARCHAR(20) CHECK (tipo IN ('ejercicio', 'alimentacion', 'hidratacion')) NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    valor_objetivo VARCHAR(100),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    completado BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_objetivo_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

-- Tabla de Progreso Semanal (Depende de Usuario)
CREATE TABLE progreso_semanal (
    id_progreso SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    semana INT NOT NULL,
    año INT NOT NULL,
    entrenamientos_completados INT DEFAULT 0,
    tiempo_total_minutos INT DEFAULT 0,
    calorias_quemadas DECIMAL(8,2) DEFAULT 0,
    dias_activos INT DEFAULT 0,
    CONSTRAINT fk_progreso_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    CONSTRAINT uk_usuario_semana UNIQUE (id_usuario, año, semana)
);

-- ==========================================================
-- 3. TABLAS DE RELACIÓN Y REGISTROS COMPLEJOS
-- ==========================================================

-- Tabla de Entrenamiento (Depende de Rutina)
CREATE TABLE entrenamiento (
    id_entrenamiento SERIAL PRIMARY KEY,
    id_rutina INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    orden INT NOT NULL,
    duracion_estimada INT,
    CONSTRAINT fk_entrenamiento_rutina FOREIGN KEY (id_rutina) REFERENCES rutina(id_rutina)
);

-- Tabla Intermedia: Entrenamiento_Ejercicio
CREATE TABLE entrenamiento_ejercicio (
    id_relacion SERIAL PRIMARY KEY,
    id_entrenamiento INT NOT NULL,
    id_ejercicio INT NOT NULL,
    orden INT NOT NULL,
    series_especificas INT,
    repeticiones_especificas VARCHAR(50),
    CONSTRAINT fk_rel_entrenamiento FOREIGN KEY (id_entrenamiento) REFERENCES entrenamiento(id_entrenamiento),
    CONSTRAINT fk_rel_ejercicio FOREIGN KEY (id_ejercicio) REFERENCES ejercicio(id_ejercicio),
    CONSTRAINT uk_entrenamiento_ejercicio UNIQUE (id_entrenamiento, id_ejercicio)
);

-- Tabla Intermedia: Receta_Favorita (Usuario y Receta)
CREATE TABLE receta_favorita (
    id_favorita SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_receta INT NOT NULL,
    fecha_agregada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_fav_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    CONSTRAINT fk_fav_receta FOREIGN KEY (id_receta) REFERENCES receta(id_receta),
    CONSTRAINT uk_usuario_receta UNIQUE (id_usuario, id_receta)
);

-- Tabla de Relación: Usuario_Rutina
CREATE TABLE usuario_rutina (
    id_usuario_rutina SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_rutina INT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    activa BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_userut_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    CONSTRAINT fk_userut_rutina FOREIGN KEY (id_rutina) REFERENCES rutina(id_rutina)
);

-- Tabla de Registro de Entrenamientos Realizados
CREATE TABLE registro_entrenamiento (
    id_registro SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_entrenamiento INT NOT NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME,
    hora_fin TIME,
    duracion_minutos INT,
    calorias_estimadas DECIMAL(6,2),
    completado BOOLEAN DEFAULT FALSE,
    notas TEXT,
    CONSTRAINT fk_reg_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    CONSTRAINT fk_reg_entrenamiento FOREIGN KEY (id_entrenamiento) REFERENCES entrenamiento(id_entrenamiento)
);

-- ==========================================================
-- 4. ÍNDICES ADICIONALES (Para optimización)
-- ==========================================================
CREATE INDEX idx_usuario_email ON usuario(email);
CREATE INDEX idx_receta_categoria ON receta(id_categoria);
CREATE INDEX idx_rutina_nivel ON rutina(id_nivel);
CREATE INDEX idx_registro_usuario_fecha ON registro_entrenamiento(id_usuario, fecha);