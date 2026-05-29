import RecetaService from "../services/RecetaService.js";
import RegistroIngestaService from "../services/RegistroIngestaService.js";

export default class RecetaControlador {
    #refContenedorTodasRecetas;
    #refListaTodasRecetas;
    #inputBusquedaRecetas;
    #btnFiltrar;
    #contadorRecetas;
    #recetaService;
    #registroIngestaService;
    #listaRecetas;
    #listaRecetasFiltradas;
    #recetaActual;
    #idRegistroIngesta;

    constructor(){
        // Using setTimeout or ensuring DOM is ready is not strictly necessary if router does innerHTML first, but let's be safe
        this.#refListaTodasRecetas = document.getElementById("listaTodasRecetas");
        this.#inputBusquedaRecetas = document.getElementById("inputBusquedaRecetas");
        this.#btnFiltrar = document.getElementById("btnFiltrar");
        this.#contadorRecetas = document.getElementById("contadorRecetas");
        this.#recetaService = new RecetaService();
        this.#registroIngestaService = new RegistroIngestaService();
        this.#listaRecetas = [];
        this.#listaRecetasFiltradas = [];
        this.#recetaActual = null;
        this.#idRegistroIngesta = null;
    }

    async init() {
        // Re-query in init just in case constructor ran before innerHTML was ready
        this.#refListaTodasRecetas = document.getElementById("listaTodasRecetas") || this.#refListaTodasRecetas;
        this.#inputBusquedaRecetas = document.getElementById("inputBusquedaRecetas") || this.#inputBusquedaRecetas;
        this.#btnFiltrar = document.getElementById("btnFiltrar") || this.#btnFiltrar;
        this.#contadorRecetas = document.getElementById("contadorRecetas") || this.#contadorRecetas;
        
        await this.obtenerRecetas();
        await this.obtenerRegistroIngestaDeHoy();
        this.renderizarRecetas(this.#listaRecetas);
        this.configurarEventos();
    }

    // Compatibilidad para router (se llamaba inicializar() pero router llama a init())
    async inicializar() {
        await this.init();
    }

    async obtenerRecetas() {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            this.#listaRecetas = await this.#recetaService.obtenerRecetas(token);
            this.#listaRecetasFiltradas = [...this.#listaRecetas];
            console.log("Recetas cargadas:", this.#listaRecetas);
        } catch (error) {
            console.log("Error al obtener recetas:", error);
            this.#listaRecetas = [];
            this.#listaRecetasFiltradas = [];
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

            const d = new Date();
            const hoy = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

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
        if (this.#refListaTodasRecetas) {
            // Eliminar listener previo si existe para no duplicar (aunque router destruye instancia)
            this.#refListaTodasRecetas.addEventListener('click', (e) => {
                const recetaCard = e.target.closest(".tarjetaInfoDinamica");
                if (recetaCard) {
                    this.abrirModalReceta(recetaCard.dataset.id);
                }
            });
        }

        if (this.#inputBusquedaRecetas) {
            // Evitar comportamiento por defecto del enter que recargue
            this.#inputBusquedaRecetas.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') e.preventDefault();
            });
            this.#inputBusquedaRecetas.addEventListener('keyup', (e) => {
                this.filtrarRecetas(e.target.value);
            });
            // También escuchar 'input' para copiado y pegado
            this.#inputBusquedaRecetas.addEventListener('input', (e) => {
                this.filtrarRecetas(e.target.value);
            });
        }

        if (this.#btnFiltrar) {
            this.#btnFiltrar.addEventListener('click', () => {
                if (this.#inputBusquedaRecetas) {
                    this.#inputBusquedaRecetas.focus();
                }
            });
        }

        // Use global event delegation for close button to ensure it binds even if DOM is recreated
        const modal = document.getElementById("modalAlimentacion");
        if (modal) {
            const btnCerrar = document.getElementById("btnCerrarModal");
            if (btnCerrar) {
                // Replacing with onclick to avoid duplicate listeners
                btnCerrar.onclick = () => {
                    modal.classList.remove("activo");
                };
            }

            const btnConsumo = document.getElementById("btnAgregarConsumo");
            if (btnConsumo) {
                btnConsumo.onclick = () => {
                    this.agregarRecetaAConsumo();
                };
            }
        }
    }

    filtrarRecetas(terminoBusqueda) {
        terminoBusqueda = terminoBusqueda.toLowerCase().trim();
        
        if (!terminoBusqueda) {
            this.#listaRecetasFiltradas = [...this.#listaRecetas];
        } else {
            this.#listaRecetasFiltradas = this.#listaRecetas.filter(receta => {
                const nombreMatch = (receta.nombre_receta || "").toLowerCase().includes(terminoBusqueda);
                
                let ingredientesMatch = false;
                if (receta.ingredientes && receta.ingredientes.length > 0) {
                    ingredientesMatch = receta.ingredientes.some(ing => {
                        const nombreIng = (ing.nombreIngrediente || ing.nombre_ingrediente || ing).toLowerCase();
                        return nombreIng.includes(terminoBusqueda);
                    });
                }
                
                return nombreMatch || ingredientesMatch;
            });
        }
        
        this.renderizarRecetas(this.#listaRecetasFiltradas);
    }

    renderizarRecetas(recetas) {
        if (!this.#refListaTodasRecetas) return;
        
        if (this.#contadorRecetas) {
            this.#contadorRecetas.textContent = `${recetas.length} recetas encontradas`;
        }

        let html = '';
        if (recetas.length === 0) {
            html = '<p style="grid-column: 1 / -1; text-align: center; color: var(--colorSecundario); font-size: 1.2rem; padding: 2rem;">No se encontraron recetas.</p>';
        } else {
            recetas.forEach(receta => {
                const descripcionCorta = (receta.descripcion_general || "Deliciosa y nutritiva opción para complementar tu alimentación diaria.").substring(0, 100);
                
                html += `
                    <article class="tarjetaRutina tarjetaInfoDinamica" data-id="${receta.id_receta}" style="cursor: pointer; min-height: 320px;">
                        <div class="tarjetaRutina__nivel" style="height: 220px;">
                            <img class="tarjetaRutina_icono" src="${receta.imagen_alusiva || '../../asserts/imagenesPrueba/omelette.jpg'}" style="object-fit: cover; width: 100%; height: 100%; border-radius: 1rem 1rem 0 0;">
                        </div>
                        <div class="tarjetaRutina__contenedorInformacion" style="flex-grow: 1;">
                            <h3 class="tarjeta__subtituloContenido tarjetaRutina__nombre">${receta.nombre_receta}</h3>
                            <p class="tarjeta__texto tarjetaRutina__descripcion" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 10px;">
                                ${descripcionCorta}${receta.descripcion_general?.length > 100 ? '...' : ''}
                            </p>
                        </div>
                        <div class="tarjetaRutina__estadisticas responsivo" style="justify-content: space-between; padding: 0 1rem 1rem 1rem; border-top: none;">
                            <button type="button" class="btnVerReceta" style="background: none; border: 1px solid var(--colorTerciario); color: var(--colorTerciario); padding: 5px 15px; border-radius: 20px; font-weight: bold; cursor: pointer;">Ver detalle</button>
                            <div style="color: var(--colorPrincipal); font-weight: bold;">🔥 ${receta.calorias_aproximadas || 0} kcal</div>
                        </div>
                    </article>
                `;
            });
        }

        this.#refListaTodasRecetas.innerHTML = html;
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
            try { 
                pasosArray = JSON.parse(pasosArray); 
            } catch(e) { 
                if (pasosArray.startsWith('{') && pasosArray.endsWith('}')) {
                    let cleanedStr = pasosArray.slice(1, -1);
                    if (cleanedStr.startsWith('"') && cleanedStr.endsWith('"')) {
                        cleanedStr = cleanedStr.slice(1, -1);
                        pasosArray = cleanedStr.split('","');
                    } else {
                        pasosArray = cleanedStr.split(',');
                    }
                } else {
                    pasosArray = [pasosArray]; 
                }
            }
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