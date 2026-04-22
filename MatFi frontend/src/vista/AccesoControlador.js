//Controlador de formularios

const enlaceRegistro = document.getElementById('mostrarRegistro');
const enlaceIngreso = document.getElementById('mostrarIngreso');
const formularioRegistro = document.querySelector('.contenedor__formulario--registro');
const formularioIngreso = document.querySelector('.contenedor__formulario--ingreso');


enlaceIngreso.addEventListener('click', (cambioFormulario) => {
    cambioFormulario.preventDefault();

    formularioRegistro.classList.add('contenedor--oculto');
    formularioIngreso.classList.remove('contenedor--oculto');
});

enlaceRegistro.addEventListener('click', (cambioFormulario) => {
    cambioFormulario.preventDefault();

    formularioIngreso.classList.add('contenedor--oculto');
    formularioRegistro.classList.remove('contenedor--oculto');

});