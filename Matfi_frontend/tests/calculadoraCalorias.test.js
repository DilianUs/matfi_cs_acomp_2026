import { describe, it, expect } from "vitest";
import CalculadoraCalorias from "../src/model/CalculadoraCalorias";

describe("CalculadoraCalorias - Model", () => {

    it("debe calcular BMR para hombre", () => {

        const calc = new CalculadoraCalorias("mantenimiento", "moderado");

        const bmr = calc.calcularBMR({
            peso: 70,
            estatura: 175,
            edad: 25,
            genero: "M"
        });

        expect(bmr).toBeCloseTo(1734.75, 2);

    });

    it("debe calcular TDEE correctamente", () => {

        const calc = new CalculadoraCalorias("mantenimiento", "activo");

        const tdee = calc.calcularTDEE(1700);

        expect(tdee).toBeCloseTo(2550, 1);

    });

    it("debe ajustar calorias para perdida de peso", () => {

        const calc = new CalculadoraCalorias("perdida", "ligero");

        const resultado = calc.ajustarSegunObjetivo(2000);

        expect(resultado).toBe(1780);

    });

    it("debe guardar calorias necesarias", () => {

        const calc = new CalculadoraCalorias("aumento", "moderado");

        calc.calcularCaloriasDiarias({
            peso: 70,
            estatura: 175,
            edad: 25,
            genero: "M"
        });

        expect(calc.caloriasNecesarias).not.toBeNull();

    });

});