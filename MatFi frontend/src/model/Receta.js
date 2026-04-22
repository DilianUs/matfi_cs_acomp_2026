export default class Receta {
    //Propiedades
    /**Encapsulamiento de propiedades */
    #nombreReceta;
    #ingredientes;
    #imagenAlusiva;
    #descripcionGeneral;
    #pasosPreparacion;
    #caloriasAproximadas;
 
    //metodo constructor
    constructor(nombreReceta, ímagenAlusiva, descripcionGeneral, caloriasAproximadas){
        this.#nombreReceta = nombreReceta;
        this.#ingredientes = [];
        this.#imagenAlusiva = imagenAlusiva;
        this.#descripcionGeneral = descripcionGeneral;
        this.#pasosPreparacion = [];
        this.#caloriasAproximadas = caloriasAproximadas;
    }

    //metodos
    agregarIngrediente(nombreIngrediente){
        this.#ingredientes.push(nombreIngrediente);
    }

    eliminarIngrediente(nombreIngrediente){
        this.#ingredientes = this.ingredientes.filter((ingredientesActualizados) => ingredientesActualizados.nombreIngrediente !== nombreIngrediente);
    }

    agregarPasoDePreparacion(nuevoPaso){
        this.#pasosPreparacion.push(nuevoPaso);
    }

    mostrarReceta(){
        return `
        Receta: ${this.#nombreReceta}

        Descripción: ${this.#descripcionGeneral}

        Ingredientes:
        ${this.#ingredientes.map(ing => ing.mostrarIngrediente()).join("\n")}

        Pasos:
        ${this.#pasosPreparacion.map((p, i) => `${i + 1}. ${p}`).join("\n")}

        Calorías: ${this.#caloriasAproximadas}
        `.trim();
    }

    actualizarDescripcion(nuevaDescripcion){
        this.#descripcionGeneral = nuevaDescripcion;
    }

    actualizarCalorias(nuevasCalorias){
        this.#caloriasAproximadas = nuevasCalorias;
    }

    get obtenerIngredientes(){
        return this.#ingredientes
        .map(ing => ing.mostrarIngrediente())
        .join("\n");
    }
}