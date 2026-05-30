import { describe, it, expect, beforeEach } from "vitest";
import CalculadoraControlador from "../src/controlador/CalculadoraControlador";

describe("CalculadoraControlador", () => {

    beforeEach(() => {

        document.body.innerHTML = `
        
        <form id="formularioCalculadoraCals">

            <input id="edad" value="25">

            <input id="peso" value="70">

            <input id="estaturaUsuario" value="175">

            <input type="radio" 
                   name="genero" 
                   value="M" 
                   checked>

            <select id="nivelActividadFisica">
                <option value="moderado" selected>
                    Moderado
                </option>
            </select>

            <input type="radio"
                   name="objetivo"
                   value="perdida"
                   checked>

            <button type="submit">
                Calcular
            </button>

        </form>

        <div id="caloriasNecesarias"></div>
        <div id="objetivoCalculadora"></div>

        `;
    });

    it("debe calcular calorias y mostrar resultado", () => {

        new CalculadoraControlador();

        const formulario =
            document.getElementById("formularioCalculadoraCals");

        formulario.dispatchEvent(
            new Event("submit", {
                bubbles: true,
                cancelable: true
            })
        );

        const resultado =
            document.getElementById("caloriasNecesarias").textContent;

        const objetivo =
            document.getElementById("objetivoCalculadora").textContent;

        expect(resultado).not.toBe("");

        expect(objetivo)
            .toBe("Perdida de grasa");

    });

});