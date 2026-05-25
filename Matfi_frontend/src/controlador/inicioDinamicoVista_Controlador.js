import UsuarioService from "../services/UsuarioService.js";
import MetaFisicaService from "../services/MetaFisicaService.js";
import RegistroActividadService from "../services/RegistroActividadService.js";

export default class InicioDinamicoVista_Controlador {

    #usuarioService;
    #metaFisicaService;
    #registroActividadService;

    constructor(){

        this.#usuarioService = new UsuarioService();
        this.#metaFisicaService = new MetaFisicaService();
        this.#registroActividadService = new RegistroActividadService();
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
            await this.cargarActividadDeHoy(token);

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

    async cargarActividadDeHoy(token){

        try {

            const hoy =
                new Date().toISOString().split("T")[0];

            const registros =
                await this.#registroActividadService
                    .obtenerRegistroPorFecha(token, hoy);

            const contenedor =
                document.getElementById(
                    "contenedorHistorialEntrenamiento"
                );

            if(!contenedor) return;

            contenedor.innerHTML = "";

            if(registros.length === 0){

                contenedor.innerHTML = `
                    <p class="tarjetaEntrenamiento__detalle">
                        No hay actividad registrada hoy
                    </p>
                `;

                return;
            }

            const registro = registros[0];

            if(!registro.rutinas ||
                registro.rutinas.length === 0){

                contenedor.innerHTML = `
                    <p class="tarjetaEntrenamiento__detalle">
                        No hay rutinas registradas hoy
                    </p>
                `;

                return;
            }

            registro.rutinas.forEach(rutina => {

                contenedor.innerHTML += `
                    <article class="tarjetaEntrenamiento__actividad">

                        <div class="tarjetaEntrenamiento__info">

                            <h3 class="tarjetaEntrenamiento__nombre">
                                ${rutina.nombre_rutina || rutina.nombreRutina}
                            </h3>

                            <p class="tarjetaEntrenamiento__detalle">
                                Rutina completada
                            </p>

                        </div>

                        <span class="tarjetaEntrenamiento__calorias">
                            🔥
                        </span>

                    </article>
                `;
            });

        } catch(error){

            console.log(
                "Error cargando actividad del día",
                error
            );
        }
    }

    cargarDatosUsuario(usuario){

        const saludoUsuario = document.getElementById("saludoNombreUsuarioTexto");

        if(saludoUsuario){
            saludoUsuario.textContent = usuario.nombreUsuario || "Usuario";
        }
    }
}