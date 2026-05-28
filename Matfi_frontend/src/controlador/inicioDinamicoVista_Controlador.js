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
            const fechaStringHoy = hoy.toISOString().split('T')[0];

            // 1. Buscar si YA EXISTE un registro de actividad para hoy
            let registroActividadHoy = null;
            try {
                const registrosActividad = await this.#registroActividadService.obtenerRegistroPorFecha(token, fechaStringHoy);
                if (registrosActividad && registrosActividad.length > 0) {
                    registroActividadHoy = registrosActividad[0];
                    console.log("Registro de actividad existente para hoy:", registroActividadHoy.id_registro_actividad);
                }
            } catch (err) {
                console.log("Error al buscar registro de actividad para hoy", err);
            }

            // 2. Buscar si YA EXISTE un registro de ingesta para hoy
            let registroIngestaHoy = null;
            try {
                const registrosIngesta = await this.#registroIngestaService.obtenerRegistroPorFecha(token, fechaStringHoy);
                if (registrosIngesta && registrosIngesta.length > 0) {
                    registroIngestaHoy = registrosIngesta[0];
                    console.log("Registro de ingesta existente para hoy:", registroIngestaHoy.id_registro_ingesta);
                }
            } catch (err) {
                console.log("Error al buscar registro de ingesta para hoy", err);
            }

            // 3. Verificar si ya existen ambos registros => ya está todo listo
            if (registroActividadHoy && registroIngestaHoy) {
                console.log("Ya existen registros de actividad e ingesta para hoy. Verificando historial...");
                
                // Verificar si ya hay historial que los une
                let historial = [];
                try {
                    historial = await this.#estadisticasService.obtenerHistorial(token);
                } catch (err) {
                    console.log("No se pudo obtener historial", err);
                }

                const historialHoy = historial.find(h => {
                    const fechaH = new Date(h.fecha).toISOString().split('T')[0];
                    return fechaH === fechaStringHoy;
                });

                if (!historialHoy) {
                    // Existen registros pero no hay historial que los una -> crearlo
                    console.log("Creando historial para registros existentes...");
                    await this.#estadisticasService.crearHistorial(token, {
                        fecha: fechaStringHoy,
                        idRegistroActividad: registroActividadHoy.id_registro_actividad,
                        idRegistroIngesta: registroIngestaHoy.id_registro_ingesta
                    });
                    console.log("Historial creado exitosamente");
                } else {
                    console.log("Todo ya existe para hoy (actividad, ingesta e historial)");
                }
                return;
            }

            // 4. Verificar historial para decidir si es un nuevo día
            let necesitaNuevoRegistro = false;

            if (!registroActividadHoy && !registroIngestaHoy) {
                // No hay registros para hoy, verificar si pasaron 24h
                let historial = [];
                try {
                    historial = await this.#estadisticasService.obtenerHistorial(token);
                } catch (err) {
                    console.log("No se pudo obtener historial, asumiendo nuevo", err);
                }

                if (!historial || historial.length === 0) {
                    necesitaNuevoRegistro = true;
                } else {
                    // El historial viene ordenado DESC (más reciente primero)
                    const ultimoHistorial = historial[0];
                    const fechaUltimo = new Date(ultimoHistorial.fecha);
                    
                    const msDesdeUltimo = hoy.getTime() - fechaUltimo.getTime();
                    const horasDesdeUltimo = msDesdeUltimo / (1000 * 60 * 60);

                    if (horasDesdeUltimo >= 24) {
                        necesitaNuevoRegistro = true;
                    }
                }
            } else {
                // Solo falta uno de los dos registros
                necesitaNuevoRegistro = true;
            }

            if (necesitaNuevoRegistro) {
                console.log("Creando nuevos registros diarios e historial...");
                
                // Crear registro de actividad si no existe
                let idRegActividad;
                if (!registroActividadHoy) {
                    const resAct = await this.#registroActividadService.crearRegistro(token, {
                        fecha: fechaStringHoy,
                        caloriasQuemadas: 0
                    });
                    idRegActividad = resAct.registro?.id_registro_actividad || resAct.id_registro_actividad || resAct.id;
                    console.log("Registro de actividad creado:", idRegActividad);
                } else {
                    idRegActividad = registroActividadHoy.id_registro_actividad;
                    console.log("Reutilizando registro de actividad:", idRegActividad);
                }

                // Crear registro de ingesta si no existe
                let idRegIngesta;
                if (!registroIngestaHoy) {
                    const resIng = await this.#registroIngestaService.crearRegistro(token, {
                        fecha: fechaStringHoy,
                        caloriasConsumidas: 0
                    });
                    idRegIngesta = resIng.registro?.id_registro_ingesta || resIng.id_registro_ingesta || resIng.id;
                    console.log("Registro de ingesta creado:", idRegIngesta);
                } else {
                    idRegIngesta = registroIngestaHoy.id_registro_ingesta;
                    console.log("Reutilizando registro de ingesta:", idRegIngesta);
                }

                // Crear historial enlazando ambos
                await this.#estadisticasService.crearHistorial(token, {
                    fecha: fechaStringHoy,
                    idRegistroActividad: idRegActividad,
                    idRegistroIngesta: idRegIngesta
                });
                
                console.log("Registros diarios creados exitosamente");
            }
        } catch (error) {
            console.error("Error al verificar/crear registros diarios:", error);
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