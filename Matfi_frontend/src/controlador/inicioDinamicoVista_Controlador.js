import UsuarioService from "../services/UsuarioService.js";
import MetaFisicaService from "../services/MetaFisicaService.js";
import RegistroActividadService from "../services/RegistroActividadService.js";
import RegistroIngestaService from "../services/RegistroIngestaService.js";
import EstadisticasService from "../services/EstadisticasService.js";

export default class InicioDinamicoVista_Controlador {

    #usuarioService;
    #metaFisicaService;
    #registroActividadService;
    #registroIngestaService;
    #estadisticasService;

    constructor(){

        this.#usuarioService = new UsuarioService();
        this.#metaFisicaService = new MetaFisicaService();
        this.#registroActividadService = new RegistroActividadService();
        this.#registroIngestaService = new RegistroIngestaService();
        this.#estadisticasService = new EstadisticasService();
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

            await this.verificarYCrearRegistrosDiarios(token);

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

    async verificarYCrearRegistrosDiarios(token) {
        try {
            const hoy = new Date();
            // Formato local para comparación de 24 horas
            const fechaStringHoy = hoy.toISOString().split('T')[0];
            
            // Obtener historial existente
            let historial = [];
            try {
                historial = await this.#estadisticasService.obtenerHistorial(token);
            } catch (err) {
                console.log("No se pudo obtener historial, asumiendo nuevo", err);
            }

            let necesitaNuevoRegistro = false;

            if (!historial || historial.length === 0) {
                necesitaNuevoRegistro = true;
            } else {
                // Verificar si pasaron 24 horas. El historial está ordenado? Tomemos el último
                const ultimoHistorial = historial[historial.length - 1];
                const fechaUltimo = new Date(ultimoHistorial.fecha).toISOString().split('T')[0];
                
                if (fechaUltimo !== fechaStringHoy) {
                    necesitaNuevoRegistro = true;
                }
            }

            if (necesitaNuevoRegistro) {
                console.log("Creando nuevos registros diarios e historial...");
                
                // 1. Crear Registro Actividad Fisica
                const registroActividad = await this.#registroActividadService.crearRegistro(token, {
                    fecha: hoy.toISOString(),
                    caloriasQuemadas: 0
                });

                // 2. Crear Registro Ingesta Alimenticia
                const registroIngesta = await this.#registroIngestaService.crearRegistro(token, {
                    fecha: hoy.toISOString(),
                    caloriasConsumidas: 0
                });

                // 3. Crear Historial enlazando ambos
                await this.#estadisticasService.crearHistorial(token, {
                    fecha: hoy.toISOString(),
                    idRegistroActividad: registroActividad.id_registro_actividad || registroActividad.id,
                    idRegistroIngesta: registroIngesta.id_registro_ingesta || registroIngesta.id
                });
                
                console.log("Registros diarios creados exitosamente");
            }
        } catch (error) {
            console.error("Error al verificar/crear registros diarios:", error);
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