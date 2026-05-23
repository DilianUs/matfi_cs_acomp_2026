export default class RegistroDeIngestaAlimenticia {

    #caloriasTotalesConsumidas;
    #fecha;
    #recetasConsumidas;

    constructor(fecha = new Date()) {

        this.#fecha = fecha;
        this.#recetasConsumidas = [];
        this.#caloriasTotalesConsumidas = 0;
    }

    calcularCaloriasConsumidas() {

        this.#caloriasTotalesConsumidas = 0;

        this.#recetasConsumidas.forEach(receta => {

            this.#caloriasTotalesConsumidas += receta.calorias;
        });

        return this.#caloriasTotalesConsumidas;
    }

    registrarRecetasConsumidas(receta) {

        this.#recetasConsumidas.push(receta);

        this.calcularCaloriasConsumidas();
    }

    obtenerCaloriasTotalesConsumidas() {

        return this.#caloriasTotalesConsumidas;
    }

    obtenerFecha() {

        return this.#fecha;
    }

    obtenerRecetasConsumidas() {

        return this.#recetasConsumidas;
    }
}