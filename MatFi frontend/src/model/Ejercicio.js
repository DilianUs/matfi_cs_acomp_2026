export default class Ejercicio {
    //propiedades
    #nombreEjercicio;
    #cantidadSeries;
    #cantidadRepeticiones;
    #descripcionEjercicio;
    #videoEjercicio;

    constructor(nombreEjercicio, cantidadSeries, cantidadRepeticiones, descripcionEjercicio, videoEjercicio){
        this.#nombreEjercicio = nombreEjercicio;
        this.#cantidadSeries = cantidadSeries;
        this.#cantidadRepeticiones = cantidadRepeticiones;
        this.#descripcionEjercicio = descripcionEjercicio;
        this.#videoEjercicio = videoEjercicio;
    }

    actualizarSeries(nuevaCantidadSeries){
        this.#cantidadSeries = nuevaCantidadSeries;
    }

    actualizarRepeticiones(nuevaCantidadRepeticiones){
        this.#cantidadRepeticiones = nuevaCantidadRepeticiones;
    }

    actualizarDescripcion(nuevaDescripcion){
        this.#descripcionEjercicio = nuevaDescripcion;
    }

    mostrarVideo(){
        return this.#videoEjercicio;
    }
    mostrarEjercicio(){
        return `
        \nnombre: ${this.#nombreEjercicio}
        numero de series: ${this.#cantidadSeries}
        numero de repeticiones por serie: ${this.#cantidadRepeticiones}
        descripcion: ${this.#descripcionEjercicio}
        video explicativo: ${this.#videoEjercicio}
        `
    }
}

const nuevoEjercicio = new Ejercicio("press militar", 4, 8, "ejercicio para el trabajo de hombros", "youtube3p_9325$I!5.com");
console.log(nuevoEjercicio.mostrarEjercicio());