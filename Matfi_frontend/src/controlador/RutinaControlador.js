import RegistroActividadService from "../services/RegistroActividadService.js";
import { rutinas } from "./datosRutinas.js";


export default class RutinaControlador {

    #refContenedor;
    #refModal;
    #refBtnCerrar;
    #refBtnGuardar;
    #idRegistroActividad;
    #registroActividadService;
    #listaRutinas;
    #rutinaActual;
    // #rutinaService;

    constructor() {

        this.#refContenedor = document.getElementById("listaRutinas");
        this.#refModal = document.getElementById("modalRutina");
        this.#refBtnCerrar = document.getElementById("btnCerrarModal");
        this.#refBtnGuardar = document.getElementById("btnGuardarRegistroEjercicio");
        this.#idRegistroActividad = null;
        this.#registroActividadService = new RegistroActividadService();
        this.#rutinaActual = null;

        // this.#rutinaService = new RutinaService();

        this.inicializar();
    }

    async inicializar() {
        await this.cargarRutinas();
        await this.obtenerOCrearRegistroActividad();
        this.renderizarRutinas();
        this.eventos();
    }

    // 1. CARGA DE DATOS
    async cargarRutinas() {

        try {
            // luego cambias esto por backend
            // const data = await this.#rutinaService.obtenerRutinas();

            this.#listaRutinas = rutinas;

        } catch (error) {
            console.log("Error cargando rutinas", error);
            this.#listaRutinas = [];
        }
    }

    // 2. RENDER TARJETAS
    renderizarRutinas() {

        if (!this.#refContenedor) return;

        let html = "";

        this.#listaRutinas.forEach(r => {

            html += `
                <article class="tarjetaRutina" data-id="${r.id}">

                    <div class="tarjetaRutina__nivel">
                        <h3 class="nivelRutina__subtitulo">${r.nivel}</h3>
                        <img class="tarjetaRutina_icono" src="${r.imagen}">
                    </div>

                    <div class="tarjetaRutina__contenedorInformacion">
                        <h3 class="tarjetaRutina__nombre">${r.nombre}</h3>
                        <p class="tarjetaRutina__descripcion">${r.descripcion}</p>
                    </div>

                    <div class="tarjetaRutina__estadisticas responsivo">
                        <button class="btnAbrirRutina">Ver rutina</button>
                        <div>🏋 ${r.ejercicios.length} ejercicios</div>
                        <div>🔥 ${r.caloriasQuemadas} cal</div>
                    </div>

                </article>
            `;
        });

        this.#refContenedor.innerHTML = html;
    }

    // 3. EVENTOS
    eventos() {

        this.#refContenedor.addEventListener("click", (e) => {

            const btn = e.target.closest(".btnAbrirRutina");
            if (!btn) return;

            const card = e.target.closest(".tarjetaRutina");
            const id = Number(card.dataset.id);

            const rutina = this.#listaRutinas.find(r => r.id === id);

            if (rutina) {
                this.abrirModal(rutina);
            }
        });

        this.#refBtnCerrar.addEventListener("click", () => {
            this.#refModal.classList.remove("activo");
        });

        this.#refBtnGuardar.addEventListener("click", () => {
            this.guardarRutinaEnRegistro();
        });
    }

    // 4. MODAL DINÁMICO
    abrirModal(r) {
        this.#rutinaActual = r;

        // título
        document.getElementById("modalRutina__titulo").textContent =
            `Rutina de ${r.nombre}`;

        document.getElementById("modalRutinaDescripcion").textContent =
            r.descripcion;

        // stats
        document.getElementById("modalCalorias").textContent =
            `${r.caloriasQuemadas} kcal`;

        document.getElementById("modalTiempo").textContent =
            `${r.tiempoInvertido} min`;

        document.getElementById("modalIntensidad").textContent =
            r.nivelDeIntensidad;

        // ejercicios
        const contenedor = document.getElementById("modalEjercicios");
        contenedor.innerHTML = "";

        r.ejercicios.forEach(e => {

            contenedor.innerHTML += `
                <div class="ejercicioItem">
                    <div class="ejercicioItem__icon">🏋️</div>
                    <div class="ejercicioItem__info">
                        <h4>${e.nombre}</h4>
                        <p>Series: ${e.series} | Reps: ${e.repeticiones}</p>
                    </div>
                    <div class="ejercicioItem__arrow">›</div>
                </div>
            `;
        });

        this.#refModal.classList.add("activo");
    }

    async obtenerOCrearRegistroActividad() {

        try {
            const token = localStorage.getItem("token");

            const hoy = new Date().toISOString().split("T")[0];

            const datos = {
                fecha: hoy,
                caloriasQuemadas: 0,
                tiempoInvertido: 0,
                nivelDeIntensidad: "baja"
            };

            const registro = await this.#registroActividadService.crearRegistro(
                token,
                datos
            );

            this.#idRegistroActividad = registro.id;

            console.log("Registro creado:", registro);

        } catch (error) {
            console.log("Error creando registro", error);
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

            const respuesta = await this.#registroActividadService.agregarRutina(
                token,
                this.#idRegistroActividad,
                this.#rutinaActual.id
            );

            console.log("Guardado:", respuesta);

            alert("Rutina agregada al registro de actividad");

            this.#refModal.classList.remove("activo");

        } catch (error) {

            console.log("Error guardando rutina", error);
            alert(error.message || "Error al guardar rutina");
        }
    }
}