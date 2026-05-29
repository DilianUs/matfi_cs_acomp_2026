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
    #mesOffset;

    constructor(){

        this.#usuarioService = new UsuarioService();
        this.#metaFisicaService = new MetaFisicaService();
        this.#registroActividadService = new RegistroActividadService();
        this.#registroIngestaService = new RegistroIngestaService();
        this.#estadisticasService = new EstadisticasService();
        this.#mesOffset = 0;
        this.configurarCierreSesion();
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
            await this.cargarIngestaDeHoy(token);
            await this.actualizarCalendario();
            this.configurarNavegacionCalendario(token);

            if(metasFisicas.length > 0){
                this.cargarMetaFisica(metasFisicas[metasFisicas.length - 1], token);
            }

        } catch(error){

            console.log("Error cargando datos iniciales", error);
        }
    }

    configurarCierreSesion() {
        const btnCerrarSesion = document.getElementById("btnCerrarSesion");
        if (btnCerrarSesion) {
            btnCerrarSesion.addEventListener("click", (e) => {
                e.preventDefault();
                localStorage.removeItem("token");
                localStorage.removeItem("usuarioId");
                window.location.href = "../../index.html";
            });
        }
    }

    configurarNavegacionCalendario(token) {
        const btnAnterior = document.getElementById("btnCalendarioAnterior");
        const btnSiguiente = document.getElementById("btnCalendarioSiguiente");

        if (btnAnterior) {
            btnAnterior.addEventListener("click", async () => {
                this.#mesOffset--;
                await this.actualizarCalendario();
            });
        }

        if (btnSiguiente) {
            btnSiguiente.addEventListener("click", async () => {
                this.#mesOffset++;
                await this.actualizarCalendario();
            });
        }
    }

    async verificarYCrearRegistrosDiarios(token) {
        try {
            const hoy = new Date();
            const fechaStringHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

            let registroActividadHoy = null;
            try {
                const registrosActividad = await this.#registroActividadService.obtenerRegistroPorFecha(token, fechaStringHoy);
                if (registrosActividad && registrosActividad.length > 0) {
                    registroActividadHoy = registrosActividad[0];
                }
            } catch (err) {
                console.log("Error al buscar registro de actividad para hoy", err);
            }

            let registroIngestaHoy = null;
            try {
                const registrosIngesta = await this.#registroIngestaService.obtenerRegistroPorFecha(token, fechaStringHoy);
                if (registrosIngesta && registrosIngesta.length > 0) {
                    registroIngestaHoy = registrosIngesta[0];
                }
            } catch (err) {
                console.log("Error al buscar registro de ingesta para hoy", err);
            }

            if (registroActividadHoy && registroIngestaHoy) {
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
                    console.log("Creando historial para registros existentes...");
                    await this.#estadisticasService.crearHistorial(token, {
                        fecha: fechaStringHoy,
                        idRegistroActividad: registroActividadHoy.id_registro_actividad,
                        idRegistroIngesta: registroIngestaHoy.id_registro_ingesta
                    });
                }
                return;
            }

            let necesitaNuevoRegistro = false;

            if (!registroActividadHoy && !registroIngestaHoy) {
                let historial = [];
                try {
                    historial = await this.#estadisticasService.obtenerHistorial(token);
                } catch (err) {
                    console.log("No se pudo obtener historial, asumiendo nuevo", err);
                }

                if (!historial || historial.length === 0) {
                    necesitaNuevoRegistro = true;
                } else {
                    const ultimoHistorial = historial[0];
                    const fechaUltimo = new Date(ultimoHistorial.fecha);
                    const msDesdeUltimo = hoy.getTime() - fechaUltimo.getTime();
                    const horasDesdeUltimo = msDesdeUltimo / (1000 * 60 * 60);
                    if (horasDesdeUltimo >= 24) {
                        necesitaNuevoRegistro = true;
                    }
                }
            } else {
                necesitaNuevoRegistro = true;
            }

            if (necesitaNuevoRegistro) {
                console.log("Creando nuevos registros diarios e historial...");
                
                let idRegActividad;
                if (!registroActividadHoy) {
                    const resAct = await this.#registroActividadService.crearRegistro(token, { fecha: fechaStringHoy, caloriasQuemadas: 0 });
                    idRegActividad = resAct.registro?.id_registro_actividad || resAct.id_registro_actividad || resAct.id;
                } else {
                    idRegActividad = registroActividadHoy.id_registro_actividad;
                }

                let idRegIngesta;
                if (!registroIngestaHoy) {
                    const resIng = await this.#registroIngestaService.crearRegistro(token, { fecha: fechaStringHoy, caloriasConsumidas: 0 });
                    idRegIngesta = resIng.registro?.id_registro_ingesta || resIng.id_registro_ingesta || resIng.id;
                } else {
                    idRegIngesta = registroIngestaHoy.id_registro_ingesta;
                }

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

    async cargarMetaFisica(meta, token){

        const tipoObjetivo = document.getElementById("tipoObjetivoFisicoTexto");
        const fechaInicio = document.querySelectorAll("#fechaInicioTexto")[1];
        const calorias = document.getElementById("caloriasMetaFisicaTexto");
        const caloriasProgreso = document.getElementById("caloriasMetaFisica");

        if(tipoObjetivo){
            const objetivos = {
                perdida: "Pérdida de grasa",
                ganancia: "Ganancia muscular",
                mantenimiento: "Mantenimiento"
            };
            tipoObjetivo.textContent = objetivos[meta.tipo_de_meta] || "No especificado";
        }

        if(fechaInicio){
            const fecha = new Date(meta.fecha_inicio);
            fechaInicio.textContent = fecha.toLocaleDateString("es-MX");
        }

        const caloriasObjetivo = meta.calorias_objetivo || 1853;

        if(calorias){
            calorias.textContent = `${caloriasObjetivo} kcal`;
        }

        if(caloriasProgreso){
            caloriasProgreso.textContent = `${caloriasObjetivo} kcal`;
        }

        await this.actualizarProgresoCalorias(token, caloriasObjetivo);
        await this.actualizarRutinasRealizadas(token);
    }

    async actualizarProgresoCalorias(token, caloriasObjetivo) {
        try {
            const d = new Date();
            const hoy = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const registros = await this.#registroIngestaService.obtenerRegistroPorFecha(token, hoy);

            const caloriasConsumidas = (registros && registros.length > 0) 
                ? (registros[0].calorias_totales_consumidas || 0) 
                : 0;

            const valorCalorias = document.querySelector(".tarjetaProgreso__valor");
            if (valorCalorias) {
                valorCalorias.innerHTML = `${caloriasConsumidas} / <span id="caloriasMetaFisica">${caloriasObjetivo}</span> kcal`;
            }

            const barra = document.querySelector(".tarjetaProgreso__barraRelleno");
            if (barra) {
                const porcentaje = Math.min((caloriasConsumidas / caloriasObjetivo) * 100, 100);
                barra.style.width = `${porcentaje}%`;
            }
        } catch (error) {
            console.log("Error al actualizar progreso de calorías:", error);
        }
    }

    async actualizarRutinasRealizadas(token) {
        try {
            const d = new Date();
            const hoy = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const registros = await this.#registroActividadService.obtenerRegistroPorFecha(token, hoy);

            let rutinasCount = 0;
            if (registros && registros.length > 0) {
                const registro = registros[0];
                rutinasCount = (registro.rutinas && Array.isArray(registro.rutinas)) 
                    ? registro.rutinas.filter(r => r !== null).length 
                    : 0;
            }

            const valorRutinas = document.querySelectorAll(".tarjetaProgreso__valor")[1];
            if (valorRutinas) {
                valorRutinas.innerHTML = `${rutinasCount} <span>/ 6</span>`;
            }

            const barras = document.querySelectorAll(".tarjetaProgreso__barraRelleno");
            if (barras.length > 1) {
                const porcentaje = Math.min((rutinasCount / 6) * 100, 100);
                barras[1].style.width = `${porcentaje}%`;
            }
        } catch (error) {
            console.log("Error al actualizar rutinas realizadas:", error);
        }
    }

    async cargarActividadDeHoy(token){
        try {
            const d = new Date();
            const hoy = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

            const registros = await this.#registroActividadService.obtenerRegistroPorFecha(token, hoy);

            const contenedor = document.getElementById("contenedorHistorialEntrenamiento");
            if(!contenedor) return;

            contenedor.innerHTML = "";

            if(!registros || registros.length === 0){
                contenedor.innerHTML = `<p class="tarjetaEntrenamiento__detalle">No hay actividad registrada hoy</p>`;
                return;
            }

            const registro = registros[0];

            if(!registro.rutinas || !Array.isArray(registro.rutinas) || registro.rutinas.length === 0){
                contenedor.innerHTML = `<p class="tarjetaEntrenamiento__detalle">No hay rutinas registradas hoy</p>`;
                return;
            }

            registro.rutinas.forEach(rutina => {
                if (!rutina) return;
                contenedor.innerHTML += `
                    <article class="tarjetaEntrenamiento__actividad">
                        <div class="tarjetaEntrenamiento__info">
                            <h3 class="tarjetaEntrenamiento__nombre">${rutina.nombre_rutina || rutina.nombreRutina || "Rutina"}</h3>
                            <p class="tarjetaEntrenamiento__detalle">Rutina completada</p>
                        </div>
                        <span class="tarjetaEntrenamiento__calorias">🔥</span>
                    </article>
                `;
            });
        } catch(error){
            console.log("Error cargando actividad del día", error);
        }
    }

    async cargarIngestaDeHoy(token) {
        try {
            const d = new Date();
            const hoy = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const registros = await this.#registroIngestaService.obtenerRegistroPorFecha(token, hoy);
            
            if (!registros || registros.length === 0) return;

            const recetas = registros[0].recetas;
            if (!recetas || !Array.isArray(recetas) || recetas.length === 0) return;

            const contenedorRecetas = document.getElementById("contenedorRecetasConsumidas");
            if (contenedorRecetas) {
                contenedorRecetas.innerHTML = `<p>${recetas.length} receta(s) consumida(s) hoy</p>`;
            }
        } catch (error) {
            console.log("Error al cargar ingesta del día:", error);
        }
    }

    async actualizarCalendario() {
        const calendarioGrid = document.querySelector(".tarjetaCalendario__grid");
        if (!calendarioGrid) return;

        const hoy = new Date();
        // Aplicar offset de mes para navegación
        const fechaBase = new Date(hoy.getFullYear(), hoy.getMonth() + this.#mesOffset, 1);
        const year = fechaBase.getFullYear();
        const month = fechaBase.getMonth();
        
        // Texto del mes
        const mesTexto = fechaBase.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
        const mesCapitalizado = mesTexto.charAt(0).toUpperCase() + mesTexto.slice(1);
        
        const mesEl = document.getElementById("calendarioMesTexto") || document.querySelector(".tarjetaCalendario__mes");
        if (mesEl) mesEl.textContent = mesCapitalizado;

        const primerDia = new Date(year, month, 1).getDay();
        const ultimoDia = new Date(year, month + 1, 0).getDate();
        const diaActual = hoy.getDate();
        const mesActual = hoy.getMonth();
        const anioActual = hoy.getFullYear();

        // Obtener fechas con historial
        let fechasHistorial = [];
        try {
            const token = localStorage.getItem("token");
            if (token) {
                const historial = await this.#estadisticasService.obtenerHistorial(token);
                // Filtrar solo historiales del mes/año que estamos viendo
                fechasHistorial = historial
                    .filter(h => {
                        const f = new Date(h.fecha);
                        return f.getMonth() === month && f.getFullYear() === year;
                    })
                    .map(h => new Date(h.fecha).getDate());
            }
        } catch (err) {
            console.log("No se pudieron obtener fechas de historial para el calendario");
        }

        // Reconstruir calendario
        let html = `<span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span>`;
        
        const inicio = primerDia === 0 ? 6 : primerDia - 1;
        for (let i = 0; i < inicio; i++) {
            html += `<span class="dia dia-vacio"></span>`;
        }

        for (let d = 1; d <= ultimoDia; d++) {
            let clase = "dia";
            // Marcar como activo solo si estamos viendo el mes actual Y es el día de hoy
            if (this.#mesOffset === 0 && d === diaActual && month === mesActual && year === anioActual) {
                clase += " activo";
            } else if (fechasHistorial.includes(d)) {
                clase += " historial";
            }
            html += `<span class="${clase}">${d}</span>`;
        }

        calendarioGrid.innerHTML = html;
    }

    cargarDatosUsuario(usuario){
        const saludoUsuario = document.getElementById("saludoNombreUsuarioTexto");
        if(saludoUsuario){
            saludoUsuario.textContent = usuario.nombreUsuario || "Usuario";
        }
    }
}