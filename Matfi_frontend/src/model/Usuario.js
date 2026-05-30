export default class Usuario {
    //propiedades
    // #nombreUsuario;
    #edadUsuario;
    #generoUsuario;
    #estaturaUsuario;
    #pesoUsuario;

// ; del sistema con datos completos
    constructor(edadUsuario, generoUsuario, estaturaUsuario, pesoUsuario){
        // this.#nombreUsuario = nombreUsuario;
        this.#edadUsuario = edadUsuario;
        this.#generoUsuario = generoUsuario;
        this.#estaturaUsuario = estaturaUsuario;
        this.#pesoUsuario = pesoUsuario;
    }
    

    actualizarPeso(nuevoPeso){
        this.#pesoUsuario = nuevoPeso;
    }
    
    actualizarEstatura(nuevaEstatura){
        this.#estaturaUsuario = nuevaEstatura;
    }

    // actualizarNombre(nuevoNombre){
    //     this.#nombreUsuario = nuevoNombre;
    // }

    actualizarEdad(nuevaEdad){
        this.#edadUsuario = nuevaEdad;
    }

    //getters
    // get nombreDeUsuario() {
    //     return this.#nombreUsuario;
    // }

    mostrarUsuario(){
        return `
        edad: ${this.#edadUsuario}
        genero: ${this.#generoUsuario}
        estatura: ${this.#estaturaUsuario}
        peso: ${this.#pesoUsuario}`;
        // nombre: ${this.#nombreUsuario}
    }
}


// const nuevoUsuario = new Usuario("Cecilia Canul", 22, "mujer", 157, 59);
// console.log(nuevoUsuario.mostrarUsuario())

//ambos imprimen cosas distintas
//console.log(nuevoUsuario.mostrarUsuario())
//console.log(nuevoUsuario.mostrarUsuario)