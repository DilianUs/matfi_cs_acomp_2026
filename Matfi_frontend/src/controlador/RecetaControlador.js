import Receta from "../model/Receta.js";
import RecetaService from "../services/RecetaService.js";

export default class RecetaControlador {
    #refContenedorTarjetas;
    #refContenedorRecetas;
    #refTarjetaDesayuno;
    #refTarjetaAlmuerzo;
    #refTarjetaCena;
    #recetaService;
    #listaRecetas;

    constructor(){
        // this.#refContenedorTarjetas = document.getElementById("panelPrincipal-alimentacion");
        
        // const panelPrncipalInicial = this.#refContenedorTarjetas.innerHTML;
        this.#refTarjetaDesayuno = document.getElementById("tarjetaDesayuno");
        this.#refContenedorRecetas = document.querySelectorAll(".tarjetaRecetas");
        console.log(this.#refContenedorRecetas);
        this.#refTarjetaAlmuerzo = document.getElementById("tarjetaAlmuerzo");
        this.#refTarjetaCena = document.getElementById("tarjetaCena");
        this.#recetaService = new RecetaService();

        this.inicializar();
        this.mostrarContenidoReceta();
        // this.#refContenedorRecetas = document.querySelectorAll("tarjetaRecetas");
    }

    async inicializar() {
        await this.obtenerRecetas();

        this.actualizarTarjetaDesayuno();
        this.actualizarTarjetaAmuerzo();
        this.actualizarTarjetaCena();
        this.cerrarModalnformacionReceta();
    }

    actualizarTarjetaDesayuno(){
        if(this.#refTarjetaDesayuno){
            this.#refTarjetaDesayuno.addEventListener('click', (e) => {
                //metodo
                this.mostrarListaDesayunos();
            });
        }
        else{
            alert("Error en la operacion desayuno");
        }
    }

    actualizarTarjetaAmuerzo(){
        if(this.#refTarjetaAlmuerzo){
            this.#refTarjetaAlmuerzo.addEventListener('click', (e) => {
                //metodo
                this.mostrarListaAlmuerzos();
            });
        }
        else{
            alert("Error en la operacion almuerzo");
        }
    }

    actualizarTarjetaCena(){
        if(this.#refTarjetaCena){
            this.#refTarjetaCena.addEventListener('click', (e) => {
                //metodo
                this.mostrarListaCenas();
            });
        }
        else{
            alert("Error en la operacion cena");
        }
    }
    
    // Revisar cuando se tengan las recetas para el back
    // async obtenerRecetas(){
    //     this.#listaRecetas = this.#recetaService.obtenerReceta();
    // }

    //metodos modificadores de contenido HTML
    mostrarListaDesayunos(){
        const recetasDesayuno = this.#listaRecetas.filter(
            receta => receta.tipo == "Desayuno"
        );

        let nuevoContenido = `
            <div class="contenedorTitulo__alimentacion responsivo">
                <img src="../../asserts/paginaAlimentacion_iconos/desayuno/iconoDesayunoHover.png">
                <h2 class="tarjeta__titulo">Desayunos</h2>
            </div>
        `;

        recetasDesayuno.forEach(receta => {
            nuevoContenido += `
                <div class="contenedorListaRecetas listaRecetas">
                    <div class="listaRecetas_contenidoReceta tarjetaInfoDinamica responsivo" data-id="${receta.id}">
                        <img src="${receta.imagen}">
                        <p>${receta.nombre}</p>
                        <span>${receta.calorias} cal</span>
                    </div>
                </div>
            `;
        });
        
        this.#refTarjetaDesayuno.innerHTML = nuevoContenido;
    }

    mostrarListaAlmuerzos(){
        const recetasAlmuerzo = this.#listaRecetas.filter(
            receta => receta.tipo == "Almuerzo"
        );

        let nuevoContenido = `
            <div class="contenedorTitulo__alimentacion responsivo">
                <img src="../../asserts/paginaAlimentacion_iconos/almuerzo/iconoAlmuerzoHover.png">
                <h2 class="tarjeta__titulo">Almuerzos</h2>
            </div>
        `;

        recetasAlmuerzo.forEach(receta => {
            nuevoContenido += `
                <div class="contenedorListaRecetas listaRecetas">
                    <div class="listaRecetas_contenidoReceta tarjetaInfoDinamica responsivo" data-id="${receta.id}">
                        <img src="${receta.imagen}">
                        <p>${receta.nombre}</p>
                        <span>${receta.calorias} cal</span>
                    </div>
                </div>
            `;
        });
        

        this.#refTarjetaAlmuerzo.innerHTML = nuevoContenido;
    }

    mostrarListaCenas(){
         const recetasCena = this.#listaRecetas.filter(
            receta => receta.tipo == "Cena"
        );

        let nuevoContenido = `
            <div class="contenedorTitulo__alimentacion responsivo">
                <img src="../../asserts/paginaAlimentacion_iconos/cena/iconoCenaHover.png">
                <h2 class="tarjeta__titulo">Cenas</h2>
            </div>

        `;

        recetasCena.forEach(receta => {
            nuevoContenido += `
                <div class="contenedorListaRecetas listaRecetas">
                    <div class="listaRecetas_contenidoReceta tarjetaInfoDinamica responsivo" data-id="${receta.id}">
                        <img src="${receta.imagen}">
                        <p>${receta.nombre}</p>
                        <span>${receta.calorias} cal</span>
                    </div>
                </div>
            `;
        });
        

        this.#refTarjetaCena.innerHTML = nuevoContenido;
    }

    mostrarContenidoReceta(){
        // console.log(this.#refContenedorRecetas);
        console.log(this.#refContenedorRecetas);
        this.#refContenedorRecetas.forEach(tarjeta => {
            tarjeta.addEventListener('click', (e) => {
                // console.log(`estás en: ${tarjeta}`);
                console.log(tarjeta);

                const recetaSeleccionada = e.target.closest(".tarjetaInfoDinamica");
                if(recetaSeleccionada){
                    const id = recetaSeleccionada.dataset.id;

                    console.log(id);

                    const receta = this.#listaRecetas.find(
                            receta => receta.id == id);

                    this.modalInformacionReceta(receta);

                }

                // tarjeta.addEventListener('click', (e) =>{
                //     const idTarjeta = e.target.closest("tarjetaInfoDinamica");;
                //     console.log(idTarjeta);
                // });
            });
        });
    }

    modalInformacionReceta(receta){

        const modalReceta = document.getElementById("modalAlimentacion");

        document.getElementById("imagenReceta").src = receta.imagen;

        document.getElementById("tituloReceta").textContent = receta.nombre;

        document.getElementById("caloriasReceta").textContent = `${receta.calorias}`;

        document.getElementById("descripcionReceta").textContent = receta.descripcion;

        // ingredientes
        const ingredientes = document.getElementById("ingredientesReceta");

        ingredientes.innerHTML = "";

        receta.ingredientes.forEach(
            ingrediente => {

                ingredientes.innerHTML += `
                    <li>
                        ${ingrediente}
                    </li>
                `;
            }
        );

        // pasos
        const pasos = document.getElementById("preparacionReceta");

        pasos.innerHTML = "";

        receta.pasos.forEach(paso => {
            
            pasos.innerHTML += `
                    <li>
                        ${paso}
                    </li>
                `;
            });

        modalReceta.classList.add(
            "activo"
        );
    }

    cerrarModalnformacionReceta(){
        const btnCerrar = document.getElementById("btnCerrarModal");

        const modalReceta =
            document.getElementById(
                "modalAlimentacion"
            );

        btnCerrar.addEventListener("click", () => {
                modalReceta.classList.remove("activo");
            });
    }

    // guardarToken(){
    //     this.#token =
    //         localStorage.getItem("token");
    // }

    // metodo de prueba
    obtenerRecetas(){

        this.#listaRecetas = [
            {
                id: 1,
                nombre: "Huevos con avena",
                calorias: 430,
                tipo: "Desayuno",
                imagen: "../imagenesPrueba/omelette.jpg",
                descripcion: 
                "Lorem Ipsum es simplemente texto de relleno de la industria de la impresión y la composición tipográfica.",

                ingredientes: [
                    "Avena",
                    "Huevo",
                    "Leche"
                ],

                pasos: [
                    "Licuar ingredientes",
                    "Calentar sartén",
                    "Cocinar"
                ]

            },

            {
                id: 2,
                nombre: "Hotcakes fit",
                calorias: 510,
                tipo: "Desayuno",
                imagen: "../imagenesPrueba/pancakes.jpg",
                descripcion: 
                "Lorem Ipsum es simplemente texto de relleno de la industria de la impresión y la composición tipográfica.",

                ingredientes: [
                    "Avena",
                    "Huevo",
                    "Leche"
                ],

                pasos: [
                    "Licuar ingredientes",
                    "Calentar sartén",
                    "Cocinar"
                ]

            },

            {
                id: 3,
                nombre: "Pollo con arroz",
                calorias: 620,
                tipo: "Almuerzo",
                imagen: "../imagenesPrueba/pollo.jpg",
                descripcion: 
                "Lorem Ipsum es simplemente texto de relleno de la industria de la impresión y la composición tipográfica.",

                ingredientes: [
                    "Avena",
                    "Huevo",
                    "Leche"
                ],

                pasos: [
                    "Licuar ingredientes",
                    "Calentar sartén",
                    "Cocinar"
                ]

            },

            {
                id: 4,
                nombre: "Sándwich ligero",
                calorias: 320,
                tipo: "Cena",
                imagen: "../imagenesPrueba/sandwich.jpg",
                descripcion: 
                "Lorem Ipsum es simplemente texto de relleno de la industria de la impresión y la composición tipográfica.",

                ingredientes: [
                    "Avena",
                    "Huevo",
                    "Leche"
                ],

                pasos: [
                    "Licuar ingredientes",
                    "Calentar sartén",
                    "Cocinar"
                ]

            }
        ];
    }
    

}