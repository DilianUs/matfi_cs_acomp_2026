export default class MetaFisica {
    #tiempoDeMeta;
    #caloriasObjetivo;
    #fechaInicio;
    #fechaFinalizacion;
    #objetivoActual;

    constructor(caloriasObjetivo, fechaInicio, objetivoActual){
        this.#tiempoDeMeta = 6;
        this.#caloriasObjetivo = caloriasObjetivo;
        this.#fechaInicio = new Date(fechaInicio);
        this.#fechaFinalizacion = this.calcularFechaFinalizacion();
        this.#objetivoActual = objetivoActual;
    }

    //metodos
    // iniciarObjetivo(){

    // }
    calcularFechaFinalizacion(){
        const fechaTemporal = new Date(this.#fechaInicio);
        fechaTemporal.setMonth(fechaTemporal.getMonth() + this.#tiempoDeMeta);
        this.#fechaFinalizacion = fechaTemporal;
    }

    get objetivoActivo(){
        return this.#objetivoActual;
    }

    get obtenerCaloriasObjetivo(){
        return this.#caloriasObjetivo;
    }

    get fechaInicio(){
        return this.#fechaInicio;
    }

    get fechaFinalizacion(){
        return this.#fechaFinalizacion;
    }
}