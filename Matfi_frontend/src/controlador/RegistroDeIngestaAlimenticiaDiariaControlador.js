import RegistroDeIngestaAlimenticiaDiaria from "../model/RegistroDeIngestaAlimenticiaDiaria.js";
import RecetaService from "../../../services/RecetaService.js";

class RegistroDeIngestaAlimenticiaDiariaControlador {
    #refCaloriasReceta;
    #refRecetaId;
    #refBtnGuardar;
    #consumoDiario;
    #recetaService;

    constructor(consumoDiario, recetaService) {

        this.#consumoDiario = new RegistroDeIngestaAlimenticiaDiaria();
        this.#recetaService = new RecetaService();

        this.#refCaloriasReceta =document.getElementById("caloriasReceta");
        this.#refRecetaId = document.getElementById("recetaId");
        this.#refBtnGuardar = document.getElementById("btnAgregarConsumo");

        this.inicializarEventos();
    }

    inicializarEventos() {

        this.#refBtnGuardar.addEventListener("click", () => 
            this.registrarConsumo()
    );
    }

    registrarConsumo() {

        try {

            const recetaId =
                this.#refRecetaId.value;

            if (!recetaId) {

                throw new Error(
                    "No se encontró la receta"
                );
            }

            const receta =
                this.#recetaService.obtenerRecetaPorId(
                    recetaId
                );

            if (!receta) {

                throw new Error(
                    "La receta no existe"
                );
            }

            this.#consumoDiario
                .registrarRecetasConsumidas(
                    receta
                );

            console.log(
                "Consumo registrado correctamente"
            );

            console.log(
                "Calorías totales:",
                this.#consumoDiario
                    .obtenerCaloriasTotalesConsumidas()
            );

        } catch(error) {

            console.error(error.message);
        }
    }
}