import { describe, it, expect } from "vitest";
// import RegistroDeIngestaAlimenticiaDiaria from "../src/model/RegistroDeIngestaAlimenticiaDiaria";
import RegistroDeIngestaAlimenticia from "../src/model/RegistroDeIngestaAlimenticiaDiaria";

describe("Registro de Ingesta", () => {

    it("debe registrar recetas y sumar calorias", () => {

        const registro = new RegistroDeIngestaAlimenticia();

        const receta1 = { calorias: 200 };
        const receta2 = { calorias: 300 };

        registro.registrarRecetasConsumidas(receta1);
        registro.registrarRecetasConsumidas(receta2);

        expect(registro.obtenerCaloriasTotalesConsumidas()).toBe(500);

    });

    it("debe retornar recetas consumidas", () => {

        const registro = new RegistroDeIngestaAlimenticia();

        registro.registrarRecetasConsumidas({ calorias: 100 });

        expect(registro.obtenerRecetasConsumidas().length).toBe(1);

    });

    it("debe devolver la fecha actual por defecto", () => {

        const registro = new RegistroDeIngestaAlimenticia();

        expect(registro.obtenerFecha()).toBeInstanceOf(Date);

    });

});