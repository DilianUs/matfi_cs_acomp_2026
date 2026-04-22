export default class Rutina {
    //propiedades
    /**el simbolo (#) permite que los atributos sean privados */
    #nombreRutina;
    #descripcionRutina;
    #imagenMusculosTrabajados;
    #listaEjercicios;

    //metodo constructor
    constructor(nombreRutina, descripcionRutina, imagenMusculosTrabajados){
        this.#nombreRutina = nombreRutina;
        this.#descripcionRutina = descripcionRutina;
        this.#imagenMusculosTrabajados = imagenMusculosTrabajados;
        this.#listaEjercicios = [];
    }

    //metodos
    agregarEjercicio(){};
    eliminarEjercicio(){};
    obtenerEjercicios(){};
}