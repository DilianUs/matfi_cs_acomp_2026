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
    #metaFisicaActual;
    #fechasHistorial;

    constructor(){

        this.#usuarioService = new UsuarioService();
        this.#metaFisicaService = new MetaFisicaService();
        this.#registroActividadService = new RegistroActividadService();
        this.#registroIngestaService = new RegistroIngestaService();
        this.#estadisticasService = new EstadisticasService();
        this.#mesOffset = 0;
        this.#metaFisicaActual = null;
        this.#fechasHistorial = [];
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
            
            // Default to today
            const d = new Date();
            const hoy = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            
            if(metasFisicas.length > 0){
                this.#metaFisicaActual = metasFisicas[metasFisicas.length - 1];
                this.cargarMetaFisica(this.#metaFisicaActual, token);
            } else {
                await this.cargarActividadDeFecha(token, hoy);
                await this.actualizarProgresoCaloriasFecha(token, hoy, 1700);
            }

            await this.actualizarCalendario();
            this.configurarNavegacionCalendario(token);

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

        // Delegar clic en los días del calendario
        const calendarioGrid = document.querySelector(".tarjetaCalendario__grid");
        if (calendarioGrid) {
            calendarioGrid.addEventListener("click", async (e) => {
                const diaSpan = e.target.closest(".dia");
                if (!diaSpan || diaSpan.classList.contains("dia-vacio") || !diaSpan.dataset.fecha) return;

                const fechaSeleccionada = diaSpan.dataset.fecha; // YYYY-MM-DD
                const lblFecha = document.getElementById("fechaHistorialSeleccionada");
                if (lblFecha) lblFecha.textContent = fechaSeleccionada;
                
                const caloriasObj = this.#metaFisicaActual ? (this.#metaFisicaActual.calorias_objetivo || 1700) : 1700;

                await this.cargarActividadDeFecha(token, fechaSeleccionada);
                await this.actualizarProgresoCaloriasFecha(token, fechaSeleccionada, caloriasObj);
                
                // Resaltar seleccionado visualmente
                document.querySelectorAll(".dia").forEach(el => el.style.border = "none");
                diaSpan.style.border = "2px solid var(--colorTerciario)";
                diaSpan.style.borderRadius = "50%";
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
        const fechaInicioObj = document.getElementById("fechaInicioTexto");
        const fechaFinObj = document.getElementById("fechaFinTexto");
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

        if(fechaInicioObj && meta.fecha_inicio){
            const fechaIni = new Date(meta.fecha_inicio);
            fechaInicioObj.textContent = fechaIni.toLocaleDateString("es-MX");
        }

        if(fechaFinObj && meta.fecha_fin){
            const fechaFin = new Date(meta.fecha_fin);
            fechaFinObj.textContent = fechaFin.toLocaleDateString("es-MX");
        }

        const caloriasObjetivo = meta.calorias_objetivo || 1700;

        if(calorias){
            calorias.textContent = `${caloriasObjetivo} kcal`;
        }

        if(caloriasProgreso){
            caloriasProgreso.textContent = `${caloriasObjetivo} kcal`;
        }

        // Progreso semanal basado en calorías
        await this.actualizarProgresoSemanal(token, caloriasObjetivo);

        const d = new Date();
        const hoyStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        
        await this.cargarActividadDeFecha(token, hoyStr);
        await this.actualizarProgresoCaloriasFecha(token, hoyStr, caloriasObjetivo);
    }

    async actualizarProgresoSemanal(token, caloriasDiarias) {
        try {
            const hoy = new Date();
            const diaSemana = hoy.getDay(); // 0 = Domingo, 1 = Lunes
            // Ajustar para que la semana inicie en Lunes
            const diasDesdeLunes = diaSemana === 0 ? 6 : diaSemana - 1;
            
            const promesas = [];
            
            // Iterar desde el lunes de esta semana hasta el día de hoy
            for (let i = 0; i <= diasDesdeLunes; i++) {
                const fechaFiltro = new Date(hoy);
                fechaFiltro.setDate(hoy.getDate() - (diasDesdeLunes - i));
                const fechaStr = `${fechaFiltro.getFullYear()}-${String(fechaFiltro.getMonth() + 1).padStart(2, '0')}-${String(fechaFiltro.getDate()).padStart(2, '0')}`;
                
                promesas.push(this.#registroIngestaService.obtenerRegistroPorFecha(token, fechaStr));
            }

            const resultados = await Promise.all(promesas);
            
            let caloriasConsumidasSemana = 0;
            resultados.forEach(registros => {
                if (registros && registros.length > 0) {
                    caloriasConsumidasSemana += (registros[0].calorias_totales_consumidas || 0);
                }
            });

            // La meta semanal es lo que debe consumir diariamente multiplicado por 7 días
            const caloriasObjetivoSemanal = caloriasDiarias * 7;
            let porcentaje = Math.min((caloriasConsumidasSemana / caloriasObjetivoSemanal) * 100, 100);

            const barraObjetivo = document.querySelector(".barraProgreso__relleno");
            const textoObjetivo = document.querySelector(".tarjetaObjetivos__texto");
            
            if (barraObjetivo && textoObjetivo) {
                barraObjetivo.style.width = `${porcentaje}%`;
                textoObjetivo.textContent = `${Math.round(porcentaje)}% del consumo semanal (${Math.round(caloriasConsumidasSemana)} / ${caloriasObjetivoSemanal} kcal)`;
            }
        } catch (error) {
            console.log("Error al calcular progreso semanal:", error);
        }
    }

    async actualizarProgresoCaloriasFecha(token, fechaStr, caloriasObjetivo) {
        try {
            const registrosIngesta = await this.#registroIngestaService.obtenerRegistroPorFecha(token, fechaStr);
            const caloriasConsumidas = (registrosIngesta && registrosIngesta.length > 0) 
                ? (registrosIngesta[0].calorias_totales_consumidas || 0) 
                : 0;

            const valorCalorias = document.querySelector(".tarjetaProgreso__valor");
            if (valorCalorias) {
                valorCalorias.innerHTML = `${caloriasConsumidas} / <span id="caloriasMetaFisica">${caloriasObjetivo}</span> kcal`;
            }

            const barras = document.querySelectorAll(".tarjetaProgreso__barraRelleno");
            if (barras.length > 0) {
                const porcentaje = Math.min((caloriasConsumidas / caloriasObjetivo) * 100, 100);
                barras[0].style.width = `${porcentaje}%`;
            }

            // Actualizar también progreso de rutinas de esa fecha
            const registrosAct = await this.#registroActividadService.obtenerRegistroPorFecha(token, fechaStr);
            let rutinasCount = 0;
            if (registrosAct && registrosAct.length > 0) {
                const registro = registrosAct[0];
                rutinasCount = (registro.rutinas && Array.isArray(registro.rutinas)) 
                    ? registro.rutinas.filter(r => r !== null).length 
                    : 0;
            }

            const valorRutinas = document.querySelectorAll(".tarjetaProgreso__valor")[1];
            if (valorRutinas) {
                valorRutinas.innerHTML = `${rutinasCount} <span>/ 6</span>`;
            }

            if (barras.length > 1) {
                const porcentajeRut = Math.min((rutinasCount / 6) * 100, 100);
                barras[1].style.width = `${porcentajeRut}%`;
            }

        } catch (error) {
            console.log("Error al actualizar progreso de calorías:", error);
        }
    }

    async cargarActividadDeFecha(token, fechaStr){
        try {
            const registros = await this.#registroActividadService.obtenerRegistroPorFecha(token, fechaStr);

            const contenedor = document.getElementById("contenedorHistorialEntrenamiento");
            if(!contenedor) return;

            contenedor.innerHTML = "";

            if(!registros || registros.length === 0){
                contenedor.innerHTML = `<p class="tarjetaEntrenamiento__detalle" style="text-align:center; margin-top:20px;">No hay actividad registrada en esta fecha</p>`;
                return;
            }

            const registro = registros[0];

            if(!registro.rutinas || !Array.isArray(registro.rutinas) || registro.rutinas.length === 0){
                contenedor.innerHTML = `<p class="tarjetaEntrenamiento__detalle" style="text-align:center; margin-top:20px;">No hay rutinas completadas en esta fecha</p>`;
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
            console.log("Error cargando actividad de fecha", error);
        }
    }

    async actualizarCalendario() {
        const calendarioGrid = document.querySelector(".tarjetaCalendario__grid");
        if (!calendarioGrid) return;

        const hoy = new Date();
        const fechaBase = new Date(hoy.getFullYear(), hoy.getMonth() + this.#mesOffset, 1);
        const year = fechaBase.getFullYear();
        const month = fechaBase.getMonth();
        
        const mesTexto = fechaBase.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
        const mesCapitalizado = mesTexto.charAt(0).toUpperCase() + mesTexto.slice(1);
        
        const mesEl = document.getElementById("calendarioMesTexto") || document.querySelector(".tarjetaCalendario__mes");
        if (mesEl) mesEl.textContent = mesCapitalizado;

        const primerDia = new Date(year, month, 1).getDay();
        const ultimoDia = new Date(year, month + 1, 0).getDate();
        const diaActual = hoy.getDate();
        const mesActual = hoy.getMonth();
        const anioActual = hoy.getFullYear();

        // Obtener fechas con historial una sola vez si no se han cargado, o cargarlas del mes actual
        try {
            const token = localStorage.getItem("token");
            if (token) {
                const historial = await this.#estadisticasService.obtenerHistorial(token);
                this.#fechasHistorial = historial.map(h => new Date(h.fecha).toISOString().split('T')[0]);
            }
        } catch (err) {
            console.log("No se pudieron obtener fechas de historial para el calendario");
        }

        // Meta física start and end date logic
        let iniMs = 0, finMs = 0;
        if(this.#metaFisicaActual && this.#metaFisicaActual.fecha_inicio && this.#metaFisicaActual.fecha_fin) {
            iniMs = new Date(this.#metaFisicaActual.fecha_inicio).getTime();
            finMs = new Date(this.#metaFisicaActual.fecha_fin).getTime();
        }

        let html = `<span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span>`;
        
        const inicio = primerDia === 0 ? 6 : primerDia - 1;
        for (let i = 0; i < inicio; i++) {
            html += `<span class="dia dia-vacio"></span>`;
        }

        for (let d = 1; d <= ultimoDia; d++) {
            const dateObj = new Date(year, month, d);
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const dateMs = dateObj.getTime();
            
            let clase = "dia";
            let inlineStyle = "cursor: pointer;";

            // Si hay historial en este día
            if (this.#fechasHistorial.includes(dateStr)) {
                clase += " historial";
            }

            // Lógica de colores de la meta física
            if (iniMs > 0 && finMs > 0) {
                if (dateStr === this.#metaFisicaActual.fecha_inicio.split('T')[0]) {
                    inlineStyle += " background-color: var(--colorTerciario); color: black; font-weight: bold;";
                } else if (dateStr === this.#metaFisicaActual.fecha_fin.split('T')[0]) {
                    inlineStyle += " background-color: #ff4757; color: white; font-weight: bold;";
                } else if (dateMs > iniMs && dateMs < finMs && dateMs <= hoy.getTime()) {
                    // Días transcurridos
                    inlineStyle += " background-color: rgba(213, 244, 32, 0.2);";
                }
            }

            // Marcar el día actual
            if (this.#mesOffset === 0 && d === diaActual && month === mesActual && year === anioActual) {
                clase += " activo";
            } 
            
            html += `<span class="${clase}" data-fecha="${dateStr}" style="${inlineStyle}">${d}</span>`;
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