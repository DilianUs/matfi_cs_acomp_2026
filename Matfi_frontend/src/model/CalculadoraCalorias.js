export default class CalculadoraCalorias {
    static intensidadDeActividad = {
        sedentario: 1.2,
        ligero: 1.375,
        moderado: 1.55,
        activo: 1.725
    };
    #objetivoFisico;
    #nivelActividad;
    #caloriasNecesarias;

// sedentario → 1.2
// ligero → 1.375
// moderado → 1.55
// activo → 1.725

    constructor(objetivoFisico, nivelActividad){
        this.#objetivoFisico = objetivoFisico;
        this.#nivelActividad = 
            CalculadoraCalorias.intensidadDeActividad[nivelActividad];
        this.#caloriasNecesarias = null;
    }

    // metodos
    // Basado en la formula de Harris-Benedict
    calcularBMR({peso, estatura, edad, genero}) {
        if (genero === "M") {
            return 66 + (13.75 * peso) + (5 * estatura) - (6.75 * edad);
        } else {
            return 655 + (9.56 * peso) + (1.85 * estatura) - (4.68 * edad);
        }
    }

    calcularTDEE(bmr) {
        return bmr * this.#nivelActividad;
    }

    ajustarSegunObjetivo(caloriasMantenimiento) {
        if (this.#objetivoFisico === "perdidaGrasa"){
            return caloriasMantenimiento -300;
        } else if(this.#objetivoFisico === "aumentoMasaMuscular"){
            return caloriasMantenimiento -200;
        }
    }

    calcularCaloriasDiarias(datos) {
        const bmr = this.calcularBMR(datos);
        const tdee = this.calcularTDEE(bmr);
        this.#caloriasNecesarias = this.ajustarSegunObjetivo(tdee);
    }

    // getters
    get nivelActividadValor() {
        return this.#nivelActividad;
    }

    get objetivoValor() {
        return this.#objetivoFisico;
    }

    get caloriasNecesarias(){
        return this.#caloriasNecesarias;
    }
}


// const datos = {
//   peso: 70,
//   estatura: 170,
//   edad: 25,
//   genero: "M"
// };

// let usuarioCals = new CalculadoraCalorias("subir", 1.55);

// let resultado = usuarioCals.calcularCaloriasDiarias(datos);
// console.log(resultado);
