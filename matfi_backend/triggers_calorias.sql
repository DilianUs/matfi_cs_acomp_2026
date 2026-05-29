-- ==========================================
-- TRIGGERS PARA CÁLCULO AUTOMÁTICO DE CALORÍAS
-- ==========================================
-- Estos triggers actualizan automáticamente los campos
-- calorias_quemadas (RegistroActividadFisicaDiaria) y
-- calorias_totales_consumidas (RegistroIngestaAlimenticiaDiaria)
-- cuando se insertan o eliminan registros en las tablas intermedias.

-- ==========================================
-- 1. FUNCIÓN: recalcular calorías de actividad física
-- ==========================================
-- Suma las calorías estimadas de todas las rutinas asociadas al registro.
-- Como las rutinas no tienen un campo directo de calorías, usamos
-- una estimación basada en ejercicios: series * repeticiones * 0.5 kcal
CREATE OR REPLACE FUNCTION recalcular_calorias_actividad()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE RegistroActividadFisicaDiaria raf
    SET calorias_quemadas = COALESCE((
        SELECT SUM(
            COALESCE(e.cantidad_series, 0) * COALESCE(e.cantidad_repeticiones, 0) * 0.5
        )
        FROM RegistroActividadRutina rar
        JOIN RutinaEjercicio re ON rar.id_rutina = re.id_rutina
        JOIN Ejercicio e ON re.id_ejercicio = e.id_ejercicio
        WHERE rar.id_registro_actividad = raf.id_registro_actividad
    ), 0)
    WHERE raf.id_registro_actividad = COALESCE(NEW.id_registro_actividad, OLD.id_registro_actividad);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 2. FUNCIÓN: recalcular calorías de ingesta
-- ==========================================
-- Suma las calorías_aproximadas de todas las recetas asociadas al registro.
CREATE OR REPLACE FUNCTION recalcular_calorias_ingesta()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE RegistroIngestaAlimenticiaDiaria ria
    SET calorias_totales_consumidas = COALESCE((
        SELECT SUM(COALESCE(r.calorias_aproximadas, 0))
        FROM RegistroIngestaReceta rir
        JOIN Receta r ON rir.id_receta = r.id_receta
        WHERE rir.id_registro_ingesta = ria.id_registro_ingesta
    ), 0)
    WHERE ria.id_registro_ingesta = COALESCE(NEW.id_registro_ingesta, OLD.id_registro_ingesta);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 3. TRIGGERS para RegistroActividadRutina
-- ==========================================

CREATE TRIGGER trigger_calorias_actividad_insert
AFTER INSERT ON RegistroActividadRutina
FOR EACH ROW
EXECUTE FUNCTION recalcular_calorias_actividad();

CREATE TRIGGER trigger_calorias_actividad_delete
AFTER DELETE ON RegistroActividadRutina
FOR EACH ROW
EXECUTE FUNCTION recalcular_calorias_actividad();

-- ==========================================
-- 4. TRIGGERS para RegistroIngestaReceta
-- ==========================================

CREATE TRIGGER trigger_calorias_ingesta_insert
AFTER INSERT ON RegistroIngestaReceta
FOR EACH ROW
EXECUTE FUNCTION recalcular_calorias_ingesta();

CREATE TRIGGER trigger_calorias_ingesta_delete
AFTER DELETE ON RegistroIngestaReceta
FOR EACH ROW
EXECUTE FUNCTION recalcular_calorias_ingesta();

-- ==========================================
-- 4.5. TRIGGERS DE PROTECCIÓN CONTRA EL FRONTEND
-- ==========================================
-- Estos triggers BEFORE UPDATE garantizan que si el frontend envía un valor
-- de calorías incorrecto al intentar actualizar, la BD lo recalcule obligatoriamente.

CREATE OR REPLACE FUNCTION proteger_suma_calorias_actividad()
RETURNS TRIGGER AS $$
BEGIN
    NEW.calorias_quemadas = COALESCE((
        SELECT SUM(COALESCE(e.cantidad_series, 0) * COALESCE(e.cantidad_repeticiones, 0) * 0.5)
        FROM RegistroActividadRutina rar
        JOIN RutinaEjercicio re ON rar.id_rutina = re.id_rutina
        JOIN Ejercicio e ON re.id_ejercicio = e.id_ejercicio
        WHERE rar.id_registro_actividad = NEW.id_registro_actividad
    ), 0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION proteger_suma_calorias_ingesta()
RETURNS TRIGGER AS $$
BEGIN
    NEW.calorias_totales_consumidas = COALESCE((
        SELECT SUM(COALESCE(r.calorias_aproximadas, 0))
        FROM RegistroIngestaReceta rir
        JOIN Receta r ON rir.id_receta = r.id_receta
        WHERE rir.id_registro_ingesta = NEW.id_registro_ingesta
    ), 0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_proteger_actividad BEFORE UPDATE ON RegistroActividadFisicaDiaria FOR EACH ROW EXECUTE FUNCTION proteger_suma_calorias_actividad();
CREATE TRIGGER trg_proteger_ingesta BEFORE UPDATE ON RegistroIngestaAlimenticiaDiaria FOR EACH ROW EXECUTE FUNCTION proteger_suma_calorias_ingesta();

-- ==========================================
-- 5. RECALCULAR DATOS EXISTENTES (una sola vez)
-- ==========================================
-- Ejecuta los cálculos para todos los registros existentes en la BD

-- Recalcular calorías de actividad física existentes
UPDATE RegistroActividadFisicaDiaria raf
SET calorias_quemadas = COALESCE((
    SELECT SUM(
        COALESCE(e.cantidad_series, 0) * COALESCE(e.cantidad_repeticiones, 0) * 0.5
    )
    FROM RegistroActividadRutina rar
    JOIN RutinaEjercicio re ON rar.id_rutina = re.id_rutina
    JOIN Ejercicio e ON re.id_ejercicio = e.id_ejercicio
    WHERE rar.id_registro_actividad = raf.id_registro_actividad
), 0);

-- Recalcular calorías de ingesta existentes
UPDATE RegistroIngestaAlimenticiaDiaria ria
SET calorias_totales_consumidas = COALESCE((
    SELECT SUM(COALESCE(r.calorias_aproximadas, 0))
    FROM RegistroIngestaReceta rir
    JOIN Receta r ON rir.id_receta = r.id_receta
    WHERE rir.id_registro_ingesta = ria.id_registro_ingesta
), 0);