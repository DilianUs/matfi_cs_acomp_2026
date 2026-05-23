import CalculadoraControlador from "../controlador/CalculadoraControlador.js";
// import CuentaUsuarioControlador from "../controlador/CuentaUsuarioControlador.js";
import MetaFisicaControlador from "../controlador/MetaFisicaControlador.js";
// import PerfilControlador from "../controlador/PerfilControlador.js";
import RecetaControlador from "../controlador/RecetaControlador.js"


const contenidoPrincipal = document.getElementById("panelPrincipal");
let controladorActivo = null;

function cargarControlador(vista) {

    if (controladorActivo?.destroy) {
        controladorActivo.destroy();
    }

    controladorActivo = null;

    if (vista.includes("perfil")) {
        controladorActivo = new PerfilControlador();
    }

    if (vista.includes("calculadora")) {
        controladorActivo = new CalculadoraControlador();
    }

    if(vista.includes("alimentacion")){
        controladorActivo = new RecetaControlador();
    }

    if (vista.includes("metafisica")) {
        controladorActivo = new MetaFisicaControlador();
    }

    if (controladorActivo?.init) {
        controladorActivo.init();
    }
}

const fcnCargarVista = async (url) => {
    const res = await fetch(url);
    const html = await res.text();

    document.body.classList.remove("fondoCalculadora");

    if (url.includes("calculadora")) {
        document.body.classList.add("fondoCalculadora");
    }
    contenidoPrincipal.innerHTML = html;

    localStorage.setItem("urlActual", url);

    cargarControlador(url);
};

document.addEventListener("click", (e) => {

    const btn = e.target;

    if (btn.id === "btnInicioVista") {
        fcnCargarVista("inicioApp-Prueba.html");
    }

    if (btn.id === "btnAlimentacionVista") {
        fcnCargarVista("alimentacionVista-.html");
    }

    if (btn.id === "btnHerramientasVista") {
        fcnCargarVista("calculadoraVista.html");
    }

    if (btn.id === "btnPerfilVista") {
        fcnCargarVista("perfilVista.html");
    }

    if (btn.id === "btnMetaFisicaVista") {
        fcnCargarVista("metaFisicaVista.html");
    }

    if(btn.id == "btnRutinasApp")
        fcnCargarVista("RutinaVista.html");
});

// const fcnCargarVista = async (urlArchivo) => {
//     try {
//         const urlVista = await fetch(urlArchivo);
//         const nuevoContenido = await urlVista.text();
//         contenidoPrincipal.innerHTML = nuevoContenido;

//         document.body.classList.remove("fondoCalculadora");
//         if (urlArchivo.includes("calculadora")) {
//              new CalculadoraControlador();
//             document.body.classList.add("fondoCalculadora");
//         }


//         document.addEventListener("DOMContentLoaded", () => {
//             const ultimaVista = localStorage.getItem("urlActual");

//             if (ultimaVista) {
//                 fcnCargarVista(ultimaVista);
//             } else {
//                 fcnCargarVista("inicioDinamico.html");
//             }
//         });
//     } catch(error){
//         console.log("Error al cargar la vista");
//     } 
// }

// let calculadoraInstancia = null;

// const fcnCargarVista = async (urlArchivo) => {
//     try {
//         const urlVista = await fetch(urlArchivo);
//         const nuevoContenido = await urlVista.text();

//         contenidoPrincipal.innerHTML = nuevoContenido;

//         // guardar vista actual
//         localStorage.setItem("urlActual", urlArchivo);

//         // reset de estilos globales
//         document.body.classList.remove("fondoCalculadora");

//         // limpiar instancia previa si existe
//         if (calculadoraInstancia) {
//             calculadoraInstancia = null;
//         }

//         // lógica por vista
//         if (urlArchivo.includes("calculadora")) {
//             document.body.classList.add("fondoCalculadora");

//             // esperar a que el DOM esté listo dentro de la vista inyectada
//             setTimeout(() => {
//                 calculadoraInstancia = new CalculadoraControlador();
//             }, 0);
//         }

//     } catch (error) {
//         console.log("Error al cargar la vista", error);
//     }
// };

// // cargar inicial
// document.addEventListener("DOMContentLoaded", (evento) => {
//     fcnCargarVista("inicioApp-Prueba.html");
// });

// // navegacion en vistas
// // document.addEventListener("click", (e) => {
// //     if (e.target.id === "btnInicioVista") {
// //         fcnCargarVista("inicioApp-Prueba.html");
// //     }

// //     if (e.target.id === "btnAlimentacionVista") {
// //         fcnCargarVista("AlimentacionVista-copy.html");
// //     }

// //     if (e.target.id === "btnHerramientasVista") {
// //         fcnCargarVista("calculadoraVista.html");
// //     }

// //     if (e.target.id === "btnPerfilVista") {
// //         fcnCargarVista("perfilVista.html");
// //     }
// // });

// document.getElementById("btnInicioVista")
//     .addEventListener("click", () => {
//         fcnCargarVista("inicioApp-Prueba.html");
//     });

// document.getElementById("btnAlimentacionVista")
//     .addEventListener("click", () => {
//         fcnCargarVista("AlimentacionVista-copy.html");
//     });

//     // calculadoraVista-copy.html
// document.getElementById("btnHerramientasVista")
//     .addEventListener("click", () => {
//         fcnCargarVista("calculadoraVista.html");
//         // e.preventDefault();
//     });

// document.getElementById("btnPerfilVista")
//     .addEventListener("click", () => {
//         fcnCargarVista("perfilVista.html");
//     });


// document.getElementById("btnRutinasVista")

// document.getElementById("btnPerfilVista")

