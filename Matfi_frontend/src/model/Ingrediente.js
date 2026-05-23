export default class Ingrediente {
    //Propiedades
    /**Encapsulamiento de propiedades */
    #nombreIngrediente;
    #cantidad;
    #unidad;

    //metodo constructor
    constructor(nombreIngrediente, cantidad, unidad){
        this.#nombreIngrediente = nombreIngrediente;
        this.#cantidad = cantidad;
        this.#unidad = unidad;
    }

    //getters
    get cantidadIngredientes(){
        return this.#cantidad;
    }

    get unidadDeIngredientes(){
        return this.#unidad;
    }

    get nombreDelIngrediente(){
        return this.#nombreIngrediente;
    }

    //Metodos
    actualizarCantidad(nuevaCantidad){
        this.#cantidad = nuevaCantidad;
    }

    actualizarUnidad(nuevaUnidad){
        this.#unidad = nuevaUnidad;
    }

    actualizarNombre(nuevoNombre){
        this.#nombreIngrediente = nuevoNombre;
    }

    mostrarIngrediente(){
        return `nombre: ${this.#nombreIngrediente} \ncantidad: ${this.#cantidad} \nunidad: ${this.#unidad}`;
    }

}

let nuevoIngrediente = new Ingrediente("betabel", 2, "gr");
console.log(nuevoIngrediente.cantidadIngredientes)
console.log(nuevoIngrediente.mostrarIngrediente());