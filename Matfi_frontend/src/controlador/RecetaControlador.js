import RecetaService from "../services/RecetaService.js";
import RegistroIngestaService from "../services/RegistroIngestaService.js";

export default class RecetaControlador {
    #refContenedorRecetas;
    #refTarjetaDesayuno;
    #refTarjetaAlmuerzo;
    #refTarjetaCena;
    #recetaService;
    #registroIngestaService;
    #listaRecetas;
    #recetaActual;
    #idRegistroIngesta;

    constructor(){
        this.#refTarjetaDesayuno = document.getElementById("tarjetaDesayuno");
        this.#refContenedorRecetas = document.querySelectorAll(".tarjetaRecetas");
        this.#refTarjetaAlmuerzo = document.getElementById("tarjetaAlmuerzo");
        this.#refTarjetaCena = document.getElementById("tarjetaCena");
        this.#recetaService = new RecetaService();
        this.#registroIngestaService = new RegistroIngestaService();
        this.#listaRecetas = [];
        this.#recetaActual = null;
        this.#idRegistroIngesta = null;

        this.inicializar();
    }

    async inicializar() {
        await this.obtenerRecetas();
        await this.obtenerRegistroIngestaDeHoy();
        this.configurarEventos();
    }

    async obtenerRecetas() {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            this.#listaRecetas = await this.#recetaService.obtenerRecetas(token);
            console.log("Recetas cargadas:", this.#listaRecetas);
        } catch (error) {
            console.log("Error al obtener recetas:", error);
            this.#listaRecetas = [];
        }
    }

    /**
     * Solo REUTILIZA el registro de ingesta del día.
     * No lo crea porque InicioDinamicoVista_Controlador crea los 3 registros juntos
     * (actividad + ingesta + historial) al iniciar sesión.
     */
    async obtenerRegistroIngestaDeHoy() {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const hoy = new Date().toISOString().split("T")[0];

            const registros = await this.#registroIngestaService.obtenerRegistroPorFecha(token, hoy);

            if (registros && registros.length > 0) {
                this.#idRegistroIngesta = registros[0].id_registro_ingesta;
                console.log("Registro de ingesta existente reutilizado:", this.#idRegistroIngesta);
            } else {
                console.log("No hay registro de ingesta para hoy. Debe crearse desde InicioDinamicoVista_Controlador");
            }
        } catch (error) {
            console.log("Error al obtener registro de ingesta:", error);
        }
    }

    configurarEventos() {
        if (this.#refTarjetaDesayuno) {
            this.#refTarjetaDesayuno.addEventListener('click', (e) => {
                const recetaCard = e.target.closest(".tarjetaInfoDinamica");
                if (recetaCard) {
                    this.abrirModalReceta(recetaCard.dataset.id);
                } else {
                    this.mostrarListaPorTipo("Desayuno");
                }
            });
        }

        if (this.#refTarjetaAlmuerzo) {
            this.#refTarjetaAlmuerzo.addEventListener('click', (e) => {
                const recetaCard = e.target.closest(".tarjetaInfoDinamica");
                if (recetaCard) {
                    this.abrirModalReceta(recetaCard.dataset.id);
                } else {
                    this.mostrarListaPorTipo("Almuerzo");
                }
            });
        }

        if (this.#refTarjetaCena) {
            this.#refTarjetaCena.addEventListener('click', (e) => {
                const recetaCard = e.target.closest(".tarjetaInfoDinamica");
                if (recetaCard) {
                    this.abrirModalReceta(recetaCard.dataset.id);
                } else {
                    this.mostrarListaPorTipo("Cena");
                }
            });
        }

        const btnCerrar = document.getElementById("btnCerrarModal");
        if (btnCerrar) {
            btnCerrar.addEventListener("click", () => {
                document.getElementById("modalAlimentacion").classList.remove("activo");
            });
        }

        const btnConsumo = document.getElementById("btnAgregarConsumo");
        if (btnConsumo) {
            btnConsumo.addEventListener("click", () => {
                this.agregarRecetaAConsumo();
            });
        }
    }

    mostrarListaPorTipo(tipo) {
        let targetCard;
        if (tipo === "Desayuno") targetCard = this.#refTarjetaDesayuno;
        else if (tipo === "Almuerzo") targetCard = this.#refTarjetaAlmuerzo;
        else if (tipo === "Cena") targetCard = this.#refTarjetaCena;

        if (!targetCard) return;

        const iconosMap = {
            Desayuno: {
                img: "../../asserts/paginaAlimentacion_iconos/desayuno/iconoDesayunoHover.png",
                titulo: "Desayunos"
            },
            Almuerzo: {
                img: "../../asserts/paginaAlimentacion_iconos/almuerzo/iconoAlmuerzoHover.png",
                titulo: "Almuerzos"
            },
            Cena: {
                img: "../../asserts/paginaAlimentacion_iconos/cena/iconoCenaHover.png",
                titulo: "Cenas"
            }
        };

        const info = iconosMap[tipo] || iconosMap.Desayuno;

        let html = `
            <div class="contenedorTitulo__alimentacion responsivo">
                <img src="${info.img}">
                <h2 class="tarjeta__titulo">${info.titulo}</h2>
            </div>
        `;

        this.#listaRecetas.forEach(receta => {
            html += `
                <div class="contenedorListaRecetas listaRecetas">
                    <div class="listaRecetas_contenidoReceta tarjetaInfoDinamica responsivo" data-id="${receta.id_receta}">
                        <img src="${receta.imagen_alusiva || '../../asserts/imagenesPrueba/omelette.jpg'}">
                        <p>${receta.nombre_receta}</p>
                        <span>${receta.calorias_aproximadas || 0} cal</span>
                    </div>
                </div>
            `;
        });

        targetCard.innerHTML = html;
    }

    abrirModalReceta(idReceta) {
        const receta = this.#listaRecetas.find(r => r.id_receta == idReceta);
        if (!receta) return;

        this.#recetaActual = receta;

        const modal = document.getElementById("modalAlimentacion");
        if (!modal) return;

        document.getElementById("imagenReceta").src = receta.imagen_alusiva || '../../asserts/imagenesPrueba/omelette.jpg';
        document.getElementById("tituloReceta").textContent = receta.nombre_receta;
        document.getElementById("caloriasReceta").textContent = `${receta.calorias_aproximadas || 0}`;
        document.getElementById("descripcionReceta").textContent = receta.descripcion_general || "Sin descripción";

        const ingredientes = document.getElementById("ingredientesReceta");
        ingredientes.innerHTML = "";
        if (receta.ingredientes && receta.ingredientes.length > 0) {
            receta.ingredientes.forEach(ing => {
                const nombre = ing.nombreIngrediente || ing.nombre_ingrediente || ing;
                const cantidad = ing.cantidad ? ` (${ing.cantidad})` : '';
                ingredientes.innerHTML += `<li>${nombre}${cantidad}</li>`;
            });
        } else {
            ingredientes.innerHTML = "<li>Sin ingredientes registrados</li>";
        }

        const pasos = document.getElementById("preparacionReceta");
        pasos.innerHTML = "";

        let pasosArray = receta.pasos_preparacion;
        if (typeof pasosArray === 'string') {
            try { pasosArray = JSON.parse(pasosArray); } catch(e) { pasosArray = [pasosArray]; }
        }

        if (pasosArray && pasosArray.length > 0) {
            pasosArray.forEach(paso => {
                pasos.innerHTML += `<li>${paso}</li>`;
            });
        } else {
            pasos.innerHTML = "<li>Sin pasos registrados</li>";
        }

        modal.classList.add("activo");
    }

    async agregarRecetaAConsumo() {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("No hay sesión activa");
                return;
            }

            if (!this.#recetaActual) {
                alert("No hay receta seleccionada");
                return;
            }

            if (!this.#idRegistroIngesta) {
                alert("No hay registro de ingesta del día. Regresa al inicio primero.");
                return;
            }

            // Agregar receta al registro de ingesta
            await this.#registroIngestaService.agregarReceta(
                token,
                this.#idRegistroIngesta,
                this.#recetaActual.id_receta
            );

            alert("Receta agregada al consumo del día");
            document.getElementById("modalAlimentacion").classList.remove("activo");

        } catch (error) {
            console.log("Error al agregar consumo:", error);
            alert(error.message || "Error al agregar receta al consumo");
        }
    }
}