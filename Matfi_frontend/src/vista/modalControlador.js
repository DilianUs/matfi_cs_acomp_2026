// const referenciaAbrirModal = document.getElementById("btnAbrirModalDatos");
// const referenciaModalDatosUsuario = document.getElementById("modalDatosUsuario");
// const referenciaCerrarModal = document.getElementById("cerrarModal");

// referenciaAbrirModal.addEventListener('click', (e)=> {
//     e.preventDefault();
//     referenciaModalDatosUsuario.classList.add("activo");
// });

// referenciaCerrarModal.addEventListener("click", (e)=> {
//     e.preventDefault();

//     referenciaModalDatosUsuario.classList.remove("activo");
// });

// console.log("documentomodalcargado");

// document.addEventListener("click", (e) => {

//     if (e.target.id === "btnAbrirModalDatos") {
//         const modal = document.getElementById("modalDatosUsuario");
//         modal.classList.add("activo");
//     }

//     if (e.target.id === "cerrarModal") {
//         const modal = document.getElementById("modalDatosUsuario");
//         modal.classList.remove("activo");
//     }

//     if(e.target.id == "btnAbrirModalObjetivo"){
//         const modalObjetivo = document.getElementById("modalMetaFisica");
//         modalObjetivo.classList.add("activo");

//     }

//     if(e.target.id == "btnCerrarModal"){
//         const modalObjetivo = document.getElementById("modalMetaFisica");
//         modalObjetivo.classList.remove("activo");
//     }
// });

document.addEventListener("click", (e) => {

    if (e.target.closest("#btnAbrirModalDatos")) {
        document.getElementById("modalDatosUsuario")?.classList.add("activo");
    }

    if (e.target.closest("#cerrarModal")) {
        document.getElementById("modalDatosUsuario")?.classList.remove("activo");
    }

    if (e.target.closest("#btnAbrirModalObjetivo")) {
        document.getElementById("modalMetaFisica")?.classList.add("activo");
    }

    if (e.target.closest("#btnCerrarModal")) {
        document.getElementById("modalMetaFisica")?.classList.remove("activo");
    }

    // if (e.target.closest("#btnAbrirModalRutina")) {
    //     document.getElementById("modalRutina")?.classList.add("activo");
    // }

    // if (e.target.closest("#btnCerrarModal")) {
    //     document.getElementById("modalRutina")?.classList.remove("activo");
    // }

});