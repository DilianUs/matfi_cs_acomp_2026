import RegistroActividadService from "../services/RegistroActividadService.js";
// import { rutinas } from "./datosRutinas.js";
import RutinaService from "../services/RutinaService.js";

export default class RutinaControlador {

    #refContenedor;
    #refModal;
    #refBtnCerrar;
    #refBtnGuardar;
    #idRegistroActividad;
    #registroActividadService;
    #listaRutinas;
    #rutinaActual;
    #rutinaService;

    constructor() {

        this.#refContenedor = document.getElementById("listaRutinas");
        this.#refModal = document.getElementById("modalRutina");
        this.#refBtnCerrar = document.getElementById("btnCerrarModal");
        this.#refBtnGuardar = document.getElementById("btnGuardarRegistroEjercicio");
        this.#idRegistroActividad = null;
        this.#registroActividadService = new RegistroActividadService();
        this.#rutinaActual = null;
        this.#rutinaService = new RutinaService();
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
            this.#listaRutinas = await this.#rutinaService.obtenerRutinas();
            console.log("las rutinas son:")
            console.log(this.#listaRutinas);
            // this.#listaRutinas = rutinas;

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
                <article class="tarjetaRutina" data-id="${r.id_rutina}">

                    <div class="tarjetaRutina__nivel">
                        <h3 class="nivelRutina__subtitulo">Intermedio</h3>
                        <img class="tarjetaRutina_icono" src="${r.imagen_musculos_trabajados}">
                    </div>

                    <div class="tarjetaRutina__contenedorInformacion">
                        <h3 class="tarjetaRutina__nombre">${r.nombre_rutina}</h3>
                        <p class="tarjetaRutina__descripcion">${r.descripcion_rutina}</p>
                    </div>

                    <div class="tarjetaRutina__estadisticas responsivo">
                        <button class="btnAbrirRutina">Ver rutina</button>
                        <div>🏋 ${r.ejercicios.length} ejercicios</div>
                        <div>🔥 300 cal</div>
                    </div>

                </article>
            `;
        });

        this.#refContenedor.innerHTML = html;
    }

    //EVENTOS
    eventos() {

        this.#refContenedor.addEventListener("click", (e) => {
            console.log("CLICK");

            const btn = e.target.closest(".btnAbrirRutina");
            if (!btn) return;

            const card = e.target.closest(".tarjetaRutina");
            const id = Number(card.dataset.id);

            const rutina = this.#listaRutinas.find(r => r.id_rutina === id);

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
        document.getElementById("modalRutina__titulo").textContent =`Rutina de ${r.nombre_rutina}`;

        document.getElementById("modalRutinaDescripcion").textContent =r.descripcion_rutina;

        // stats
        document.getElementById("modalCalorias").textContent ="300 kcal";

        document.getElementById("modalTiempo").textContent = "60min";

        document.getElementById("modalIntensidad").textContent = "medio";

        // ejercicios
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

    async obtenerOCrearRegistroActividad() {
        try {

            const token = localStorage.getItem("token");

            if (!token) return;

            const hoy = new Date().toISOString().split("T")[0];

            // buscar registros del día
            const registros =
                await this.#registroActividadService.obtenerRegistroPorFecha(
                    token,
                    hoy
                );

            console.log("REGISTROS DEL DÍA:", registros);

            // si ya existe uno, reutilizarlo
            if (registros.length > 0) {

                this.#idRegistroActividad =
                    registros[0].id_registro_actividad;

                console.log(
                    "Registro existente:",
                    this.#idRegistroActividad
                );

                return;
            }

            // si no existe, crear uno nuevo
            const datos = {
                fecha: hoy,
                caloriasQuemadas: 0,
                tiempoInvertido: 0,
                nivelDeIntensidad: "media"
            };

            const respuesta =
                await this.#registroActividadService.crearRegistro(
                    token,
                    datos
                );

            console.log("Registro creado:", respuesta);

            this.#idRegistroActividad = respuesta.registro.id_registro_actividad;

        } catch (error) {

            console.log("Error creando registro", error);
        }
        // try {
        //     const token = localStorage.getItem("token");

        //     const hoy = new Date().toISOString().split("T")[0];

        //     const datos = {
        //         fecha: hoy,
        //         caloriasQuemadas: 0,
        //         tiempoInvertido: 0,
        //         nivelDeIntensidad: "media"
        //     };

        //     const registro = await this.#registroActividadService.crearRegistro(
        //         token,
        //         datos
        //     );
        //     console.log(registro);

        //     this.#idRegistroActividad = registro.registro.id_registro_actividad;

        //     console.log("Registro creado:", registro);

        // } catch (error) {
        //     console.log("Error creando registro", error);
        // }
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

            // agregar rutina al registro
            await this.#registroActividadService.agregarRutina(
                token,
                this.#idRegistroActividad,
                this.#rutinaActual.id_rutina
            );

            // actualizar estadísticas del registro
            await this.#registroActividadService.actualizarRegistro(
                token,
                this.#idRegistroActividad,
                {
                    caloriasQuemadas:
                        this.#rutinaActual.caloriasQuemadas || 300,

                    tiempoInvertido:
                        this.#rutinaActual.tiempoInvertido || 60,

                    nivelDeIntensidad:
                        this.#rutinaActual.nivelDeIntensidad || "media"
                }
            );

            alert("Rutina agregada correctamente");

            this.#refModal.classList.remove("activo");

        } catch (error) {

            console.log("Error guardando rutina", error);

            alert(error.message || "Error al guardar rutina");
        }
        // try {

        //     const token = localStorage.getItem("token");

        //     if (!token) {
        //         alert("No hay sesión activa");
        //         return;
        //     }

        //     if (!this.#rutinaActual) {
        //         alert("No hay rutina seleccionada");
        //         return;
        //     }

        //     const respuesta = await this.#registroActividadService.agregarRutina(token, this.#idRegistroActividad, this.#rutinaActual.id_rutina);

        //     console.log("Guardado:", respuesta);

        //     alert("Rutina agregada al registro de actividad");

        //     this.#refModal.classList.remove("activo");

        // } catch (error) {

        //     console.log("Error guardando rutina", error);
        //     alert(error.message || "Error al guardar rutina");
        // }
    }
}