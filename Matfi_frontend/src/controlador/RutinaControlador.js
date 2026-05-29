import RegistroActividadService from "../services/RegistroActividadService.js";
import RutinaService from "../services/RutinaService.js";

export default class RutinaControlador {

    #refContenedor;
    #refModal;
    #refBtnCerrar;
    #refBtnGuardar;
    #idRegistroActividad;
    #registroActividadService;
    #listaRutinas;
    #listaRutinasFiltradas;
    #rutinaActual;
    #rutinaService;

    constructor() {

        this.#refContenedor = document.getElementById("listaRutinas");
        this.#refModal = document.getElementById("modalRutina");
        this.#refBtnCerrar = document.getElementById("btnCerrarModal");
        this.#refBtnGuardar = document.getElementById("btnGuardarRegistroEjercicio");
        this.#idRegistroActividad = null;
        this.#registroActividadService = new RegistroActividadService();
        this.#listaRutinas = [];
        this.#listaRutinasFiltradas = [];
        this.#rutinaActual = null;
        this.#rutinaService = new RutinaService();
    }

    async init() {
        // Re-query to support router lifecycle
        this.#refContenedor = document.getElementById("listaRutinas") || this.#refContenedor;
        this.#refModal = document.getElementById("modalRutina") || this.#refModal;
        this.#refBtnCerrar = document.getElementById("btnCerrarModal") || this.#refBtnCerrar;
        this.#refBtnGuardar = document.getElementById("btnGuardarRegistroEjercicio") || this.#refBtnGuardar;

        await this.cargarRutinas();
        await this.obtenerRegistroActividadDeHoy();
        this.renderizarRutinas(this.#listaRutinasFiltradas);
        this.eventos();
    }

    // Compatibilidad router
    async inicializar() {
        await this.init();
    }

    async cargarRutinas() {
        try {
            this.#listaRutinas = await this.#rutinaService.obtenerRutinas();
            this.#listaRutinasFiltradas = [...this.#listaRutinas];
            console.log("las rutinas son:")
            console.log(this.#listaRutinas);
        } catch (error) {
            console.log("Error cargando rutinas", error);
            this.#listaRutinas = [];
            this.#listaRutinasFiltradas = [];
        }
    }

    renderizarRutinas(rutinas = this.#listaRutinasFiltradas) {

        if (!this.#refContenedor) return;

        let html = "";

        if (rutinas.length === 0) {
            html = '<p style="grid-column: 1 / -1; text-align: center; color: var(--colorSecundario); font-size: 1.2rem; padding: 2rem;">No se encontraron rutinas.</p>';
        } else {
            rutinas.forEach(r => {

                html += `
                    <article class="tarjetaRutina" data-id="${r.id_rutina}">

                        <div class="tarjetaRutina__nivel">
                            <h3 class="nivelRutina__subtitulo">Intermedio</h3>
                            <img class="tarjetaRutina_icono" src="${r.imagen_musculos_trabajados || '../../asserts/imagenesPrueba/rutinaPierna.jpg'}">
                        </div>

                        <div class="tarjetaRutina__contenedorInformacion">
                            <h3 class="tarjetaRutina__nombre">${r.nombre_rutina}</h3>
                            <p class="tarjetaRutina__descripcion" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${r.descripcion_rutina || 'Sin descripción'}</p>
                        </div>

                        <div class="tarjetaRutina__estadisticas responsivo">
                            <button class="btnAbrirRutina">Ver rutina</button>
                            <div>🏋 ${r.ejercicios ? r.ejercicios.length : 0} ejercicios</div>
                            <div>🔥 300 cal</div>
                        </div>

                    </article>
                `;
            });
        }

        this.#refContenedor.innerHTML = html;
    }

    eventos() {

        if (this.#refContenedor) {
            this.#refContenedor.addEventListener("click", (e) => {
                console.log("CLICK");

                const btn = e.target.closest(".btnAbrirRutina");
                if (!btn) return;

                const card = e.target.closest(".tarjetaRutina");
                if (!card) return;

                const id = Number(card.dataset.id);
                const rutina = this.#listaRutinas.find(r => r.id_rutina === id);

                if (rutina) {
                    this.abrirModal(rutina);
                }
            });
        }

        if (this.#refBtnCerrar && this.#refModal) {
            // override para evitar listeners duplicados
            this.#refBtnCerrar.onclick = () => {
                this.#refModal.classList.remove("activo");
            };
        }

        if (this.#refBtnGuardar) {
            this.#refBtnGuardar.onclick = () => {
                this.guardarRutinaEnRegistro();
            };
        }

        // Filtro por botones de grupo muscular
        const botonesGrupo = document.querySelectorAll(".grupoMuscular__btnContenido");
        botonesGrupo.forEach(btn => {
            btn.onclick = () => {
                const grupo = btn.dataset.grupo;
                this.filtrarPorGrupoMuscular(grupo);
            };
        });

        // Filtro por botones de tipo/nivel de rutina (Principiante, Intermedio)
        const botonesTipo = document.querySelectorAll(".tipoRutinas__apartado");
        botonesTipo.forEach(btn => {
            btn.onclick = () => {
                const nivelTexto = btn.querySelector("h3") ? btn.querySelector("h3").textContent : "";
                this.filtrarPorTexto(nivelTexto);
            };
        });

        // Búsqueda por texto (Barra de búsqueda superior)
        const searchInput = document.querySelector(".tarjetaConsultas__busqueda input");
        if (searchInput) {
            searchInput.oninput = (e) => {
                this.filtrarPorTexto(e.target.value);
            };
            searchInput.onkeydown = (e) => {
                if (e.key === 'Enter') e.preventDefault();
            };
        }

        const btnCerrarSesion = document.getElementById("btnCerrarSesion");
        if (btnCerrarSesion) {
            btnCerrarSesion.onclick = (e) => {
                e.preventDefault();
                localStorage.removeItem("token");
                localStorage.removeItem("usuarioId");
                window.location.href = "../../index.html";
            };
        }
    }

    filtrarPorTexto(texto) {
        const termino = texto.toLowerCase().trim();
        
        if (!termino) {
            this.#listaRutinasFiltradas = [...this.#listaRutinas];
        } else {
            this.#listaRutinasFiltradas = this.#listaRutinas.filter(rutina => {
                const nombre = (rutina.nombre_rutina || "").toLowerCase();
                const descripcion = (rutina.descripcion_rutina || "").toLowerCase();
                return nombre.includes(termino) || descripcion.includes(termino);
            });
        }
        
        this.renderizarRutinas(this.#listaRutinasFiltradas);
    }

    filtrarPorGrupoMuscular(grupo) {
        if (!grupo || grupo === "todas") {
            this.#listaRutinasFiltradas = [...this.#listaRutinas];
            this.renderizarRutinas(this.#listaRutinasFiltradas);
            return;
        }

        // Diccionario de palabras clave asociadas a cada botón de grupo muscular
        const keywordsMap = {
            "pierna": ["pierna", "glúteo", "gluteo", "cuádricep", "cuadricep", "isquio", "pantorrilla"],
            "push": ["push", "pecho", "hombro", "trícep", "tricep"],
            "pull": ["pull", "espalda", "bícep", "bicep"],
            "fullbody": ["fullbody", "full body", "cuerpo completo", "integral"],
            "brazos": ["brazo", "bícep", "bicep", "trícep", "tricep", "hombro"],
            "abdomen": ["abdomen", "core", "abs", "abdominal", "vientre"]
        };

        const keywords = keywordsMap[grupo.toLowerCase()] || [];

        this.#listaRutinasFiltradas = this.#listaRutinas.filter(rutina => {
            const nombre = (rutina.nombre_rutina || "").toLowerCase();
            
            // Verifica si alguna de las palabras clave del grupo está en el nombre de la rutina
            return keywords.some(kw => nombre.includes(kw));
        });

        this.renderizarRutinas(this.#listaRutinasFiltradas);
    }

    abrirModal(r) {
        this.#rutinaActual = r;

        document.getElementById("modalRutina__titulo").textContent =`Rutina de ${r.nombre_rutina}`;
        document.getElementById("modalRutinaDescripcion").textContent =r.descripcion_rutina;
        document.getElementById("modalCalorias").textContent ="300 kcal";
        document.getElementById("modalTiempo").textContent = "60min";
        document.getElementById("modalIntensidad").textContent = "medio";

        const contenedor = document.getElementById("modalEjercicios");
        contenedor.innerHTML = "";

        (r.ejercicios || []).forEach(e => {

            contenedor.innerHTML += `
                <div class="ejercicioItem">
                    <div class="ejercicioItem__icon">🏋️</div>
                    <div class="ejercicioItem__info">
                        <h4>${e.nombreEjercicio}</h4>
                        <p>Series: ${e.cantidadSeries} | Reps: ${e.cantidadRepeticiones}</p>
                    </div>
                    <div class="ejercicioItem__arrow">›</div>
                </div>
            `;
        });

        this.#refModal.classList.add("activo");
    }

    /**
     * Solo REUTILIZA el registro de actividad del día.
     * No lo crea porque eso lo hace InicioDinamicoVista_Controlador
     * creando los 3 registros juntos (actividad + ingesta + historial).
     */
    async obtenerRegistroActividadDeHoy() {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const d = new Date();
            const hoy = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

            const registros = await this.#registroActividadService.obtenerRegistroPorFecha(token, hoy);
            console.log("REGISTROS DEL DÍA:", registros);

            if (registros && registros.length > 0) {
                this.#idRegistroActividad = registros[0].id_registro_actividad;
                console.log("Registro existente reutilizado:", this.#idRegistroActividad);
            } else {
                console.log("No hay registro de actividad para hoy. Debe crearse desde InicioDinamicoVista_Controlador");
            }
        } catch (error) {
            console.log("Error obteniendo registro de actividad", error);
        }
    }

    async guardarRutinaEnRegistro() {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("No hay sesión activa");
                return;
            }

            if (!this.#rutinaActual) {
                alert("No hay rutina seleccionada");
                return;
            }

            if (!this.#idRegistroActividad) {
                alert("No hay registro de actividad del día. Regresa al inicio primero.");
                return;
            }

            // Agregar rutina al registro de actividad
            await this.#registroActividadService.agregarRutina(
                token,
                this.#idRegistroActividad,
                this.#rutinaActual.id_rutina
            );

            // Actualizar estadísticas del registro
            await this.#registroActividadService.actualizarRegistro(
                token,
                this.#idRegistroActividad,
                {
                    tiempoInvertido: this.#rutinaActual.tiempoInvertido || 60,
                    nivelDeIntensidad: this.#rutinaActual.nivelDeIntensidad || "media"
                }
            );

            alert("Rutina agregada correctamente");
            this.#refModal.classList.remove("activo");

        } catch (error) {
            console.log("Error guardando rutina", error);
            alert(error.message || "Error al guardar rutina");
        }
    }
}