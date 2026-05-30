import { describe, it, expect } from "vitest";
import MetaFisica from "../src/model/MetaFisica";

describe("MetaFisica", () => {

    it("debe calcular fecha de finalización", () => {

        const meta = new MetaFisica(
            2000,
            "2026-01-01",
            "perdida"
        );

        const fechaFinal = meta.calcularFechaFinalizacion();

        expect(fechaFinal).toBeInstanceOf(Date);

    });

    it("debe guardar calorias objetivo", () => {

        const meta = new MetaFisica(
            2000,
            "2026-01-01",
            "perdida"
        );

        expect(meta.obtenerCaloriasObjetivo).toBe(2000);

    });

    it("debe tener objetivo activo", () => {

        const meta = new MetaFisica(
            2000,
            "2026-01-01",
            "ganancia"
        );

        expect(meta.objetivoActivo).toBe("ganancia");

    });

});