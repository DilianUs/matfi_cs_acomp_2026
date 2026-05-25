import CalculadoraCalorias from "../model/CalculadoraCalorias.js";

export default class CalculadoraControlador {
    #referenciaFormulario;
    #referenciaResultadoCalculadora;
    #referenciaObjetivoCalculadora;
    #objetivoEstablecido;

    constructor(){
    this.#referenciaFormulario = document.getElementById('formularioCalculadoraCals');
    this.#referenciaResultadoCalculadora = document.getElementById("caloriasNecesarias");
    this.#referenciaObjetivoCalculadora = document.getElementById("objetivoCalculadora");
    this.iniciarControlador();
    }

    iniciarControlador(){
        document.addEventListener("submit", (e) => {
            e.preventDefault();

            const datosFormulario = this.obtenerDatosFormulario();
            console.log(datosFormulario);
            // const resultado = this.obtenerCaloriasDeResultado();
            const resultado = this.obtenerCaloriasDeResultado(datosFormulario);
            // this.mostrarResultado(resultado);
            console.log(resultado);
            this.#referenciaResultadoCalculadora.textContent = Math.round(resultado);
            this.#referenciaObjetivoCalculadora.textContent = this.mostrarObjetivo();
            // console.log(toString(this.obtenerDatosFormulario));
        });

        // const resultado = this.obtenerCaloriasDeResultado(datosFormulario);
        
    }

     obtenerDatosFormulario() {
        return{
            edad: parseInt(document.getElementById("edad").value),
            peso: parseFloat(document.getElementById("peso").value),
            estatura: parseFloat(document.getElementById("estaturaUsuario").value),
            genero: document.querySelector('input[name="genero"]:checked').value,
            nivelActividad: document.getElementById("nivelActividadFisica").value,
            objetivo: document.querySelector('input[name="objetivo"]:checked').value, 
        }

        // edad: parseInt(document.getElementById("edad").value);
        // peso: parseFloat(document.getElementById("peso").value);
        // console.log(`edad: ${edad}, peso: ${peso}`);
        
    }

    obtenerCaloriasDeResultado(datosFormulario) {

        let nuevoCalculo = new CalculadoraCalorias(datosFormulario.objetivo, datosFormulario.nivelActividad);
        nuevoCalculo.calcularCaloriasDiarias(datosFormulario);

        this.#objetivoEstablecido = nuevoCalculo.objetivoValor;
        return nuevoCalculo.caloriasNecesarias;
        // {peso, estatura, edad, genero
        // this.#referenciaResultadoCalculadora.textContent = nuevoCalculo.caloriasNecesarias();
    }

    //Mostrar resultado en el HTML
    mostrarObjetivo() {
        if(this.#objetivoEstablecido == "perdida"){
            return "Perdida de grasa";
        }else if(this.#objetivoEstablecido == "mantenimiento"){
            return "Mantenimiento de peso corporal";
        }else {
            return "Aumento de masa muscular";
        };
        // if (!this.#resultadoCalculadora) return;

        // this.#resultadoCalculadora = `${Math.round(resultado)}`;
    }
}



// document.addEventListener("DOMContentLoaded", () => {
//     CalculadoraControlador.mostrarCalorias();
//     // UsuarioControlador.recuperarFormularioInicioSesion();
// });