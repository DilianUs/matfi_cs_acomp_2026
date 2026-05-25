import UsuarioService from "../services/UsuarioService.js";
import MetaFisicaService from "../services/MetaFisicaService.js";

export default class InicioDinamicoVista_Controlador {

    #usuarioService;
    #metaFisicaService;

    constructor(){

        this.#usuarioService = new UsuarioService();
        this.#metaFisicaService = new MetaFisicaService();

        this.cargarInformacionInicio();
    }

    async cargarInformacionInicio(){

        const token = localStorage.getItem("token");

        if(!token){
            console.log("No existe sesión iniciada");
            return;
        }

        try {

            const usuario = await this.#usuarioService.obtenerPerfil(token);

            const metasFisicas = await this.#metaFisicaService.obtenerMetasFisicas(token);
            console.log("las metas fisicas son:" , metasFisicas)
            this.cargarDatosUsuario(usuario);

            if(metasFisicas.length > 0){

                this.cargarMetaFisica(metasFisicas[metasFisicas.length - 1]);

            }

        } catch(error){

            console.log("Error cargando datos iniciales", error);
        }
    }

    cargarDatosUsuario(usuario){

        const nombreUsuario = document.getElementById("nombreUsuarioTexto");

        if(nombreUsuario){
            nombreUsuario.textContent = usuario.nombreUsuario || "Usuario";
        }
    }

    cargarMetaFisica(meta){

        const tipoObjetivo = document.getElementById("tipoObjetivoFisicoTexto");
        const fechaInicio = document.querySelectorAll("#fechaInicioTexto")[1];
        const calorias = document.getElementById("caloriasMetaFisicaTexto");
        const caloriasProgreso = document.getElementById("caloriasMetaFisica");

        console.log(meta);
        if(tipoObjetivo){

            const objetivos = {
                perdida: "Pérdida de grasa",
                ganancia: "Ganancia muscular",
                mantenimiento: "Mantenimiento"
            };

            tipoObjetivo.textContent =
                objetivos[meta.tipo_de_meta] || "No especificado";
        }

        if(fechaInicio){

            const fecha = new Date(meta.fecha_inicio);

            fechaInicio.textContent =
                fecha.toLocaleDateString("es-MX");
        }

        if(calorias){

            calorias.textContent =
                `${meta.calorias_objetivo} kcal`;
        }

        if(caloriasProgreso){
            caloriasProgreso.textContent =
                `${meta.calorias_objetivo} kcal`;
        }
    }

    // mostrarMetaVacia(){

    //     const tipoObjetivo = document.getElementById("tipoObjetivoFisicoTexto");
    //     const fechaInicio = document.querySelectorAll("#fechaInicioTexto")[1];
    //     const calorias = document.getElementById("caloriasMetaFisicaTexto");

    //     if(tipoObjetivo){
    //         tipoObjetivo.textContent = "No especificado";
    //     }

    //     if(fechaInicio){
    //         fechaInicio.textContent = "No especificada";
    //     }

    //     if(calorias){
    //         calorias.textContent = "No establecidas";
    //     }
    // }

    cargarDatosUsuario(usuario){

        const saludoUsuario = document.getElementById("saludoNombreUsuarioTexto");

        if(saludoUsuario){
            saludoUsuario.textContent = usuario.nombreUsuario || "Usuario";
        }
    }
}