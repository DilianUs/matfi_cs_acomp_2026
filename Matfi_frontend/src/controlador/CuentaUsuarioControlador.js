import Usuario from "../model/Usuario.js";
import CuentaDeUsuario from "../model/CuentaDeUsuario.js";
import UsuarioService from "../services/UsuarioService.js";
import MetaFisicaService from "../services/MetaFisicaService.js";

class CuentaUsuarioControlador {
    #servicioUsuario;
    #servicioMetaFisica;
    #datosPerfilTemporal; // Para guardar datos y usarlos en el cálculo de calorías

    constructor(){
        this.#servicioUsuario = new UsuarioService();
        this.#servicioMetaFisica = new MetaFisicaService();
        this.#datosPerfilTemporal = {};
        this.inicializar();
    }

    inicializar() {
        this.recuperarFormularioRegistro();
        this.recuperarFormularioInicioSesion();
        this.recuperarFormulariosSecuencia();
    }

    recuperarFormularioRegistro(){
        const formularioRegistro = document.getElementById("formularioRegistro");
        if(formularioRegistro){
            formularioRegistro.addEventListener('submit', (e) => {
                this.registrarUsuario(e);
            });
        }
    }

    recuperarFormularioInicioSesion(){
        const formularioInicioSesion = document.getElementById("formularioInicioSesion");
        if(formularioInicioSesion){
            formularioInicioSesion.addEventListener('submit', (e) => {
                this.iniciarSesion(e);
            });
        }
    }

    recuperarFormulariosSecuencia() {
        const formPerfil = document.getElementById("formularioPerfilSecuencia");
        if(formPerfil) {
            formPerfil.addEventListener('submit', (e) => this.guardarPerfil(e));
        }

        const formMeta = document.getElementById("formularioMetaSecuencia");
        if(formMeta) {
            formMeta.addEventListener('submit', (e) => this.guardarMeta(e));
        }
    }

    async registrarUsuario(e){
        e.preventDefault();
        const nombre = document.getElementById('nombreUsuario').value;
        const correo = document.getElementById('correoElectronicoRegistro').value;
        const contrasenia = document.getElementById('contraseniaUsuarioRegistro').value;

        if(!nombre || !correo || !contrasenia){
            Swal.fire({
                icon: 'warning',
                title: 'Campos incompletos',
                text: 'Por favor, completa todos los campos del registro inicial.'
            });
            return;
        }

        const datosRegistro = {
            nombreUsuario: nombre,
            correoUsuario: correo,
            contraseniaUsuario: contrasenia
        };

        try{
            const res = await this.#servicioUsuario.registrar(datosRegistro);

            if (res.token) {
                localStorage.setItem("token", res.token);
                if (res.user && res.user.idUsuario) {
                    localStorage.setItem("usuarioId", res.user.idUsuario);
                }
                
                Swal.fire({
                    icon: 'success',
                    title: '¡Registro Exitoso!',
                    text: 'Por favor completa los datos de tu perfil.',
                    confirmButtonText: 'Continuar'
                }).then(() => {
                    document.querySelector('.contenedor__formulario--registro').classList.add('contenedor--oculto');
                    document.querySelector('.contenedor__formulario--perfil').classList.remove('contenedor--oculto');
                });
                
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error de registro',
                    text: 'Lo sentimos, el registro fue incorrecto.'
                });
            }

        } catch (error) {
            console.error("Error en registro:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error en el registro: ' + error.message
            });
        }
    }

    async guardarPerfil(e) {
        e.preventDefault();
        const generoSelect = document.getElementById('generoUsuarioPerfil').value;
        const edad = parseInt(document.getElementById('edadUsuarioPerfil').value);
        let estatura = parseFloat(document.getElementById('estaturaUsuarioPerfil').value);
        const peso = parseFloat(document.getElementById('pesoUsuarioPerfil').value);

        if(!generoSelect || isNaN(edad) || isNaN(estatura) || isNaN(peso)) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos incompletos',
                text: 'Por favor, completa todos los campos de perfil.'
            });
            return;
        }

        // Si la estatura es menor a 3 (ej. 1.75), asumimos que está en metros y la pasamos a cm para la API y cálculo
        if (estatura < 3) {
            estatura = estatura * 100;
        }

        const token = localStorage.getItem("token");
        if(!token) {
            Swal.fire({
                icon: 'error',
                title: 'Sesión no encontrada',
                text: 'No hay sesión activa. Intenta iniciar sesión nuevamente.'
            });
            return;
        }

        const genero = generoSelect === "M" ? "Femenino" : "Masculino";

        const datosPerfil = {
            generoUsuario: genero,
            edadUsuario: edad,
            estaturaUsuario: estatura,
            pesoUsuario: peso
        };

        // Guardamos temporalmente para el cálculo de calorías
        this.#datosPerfilTemporal = { genero: generoSelect, edad, estatura, peso };

        try {
            const res = await this.#servicioUsuario.actualizarPerfil(token, datosPerfil);
            if(res.user) {
                Swal.fire({
                    icon: 'success',
                    title: 'Perfil Guardado',
                    text: 'Por último, define tu meta física.',
                    confirmButtonText: 'Continuar'
                }).then(() => {
                    document.querySelector('.contenedor__formulario--perfil').classList.add('contenedor--oculto');
                    document.querySelector('.contenedor__formulario--meta').classList.remove('contenedor--oculto');
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Hubo un problema al actualizar tu perfil.'
                });
            }
        } catch (error) {
            console.error("Error al guardar perfil:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al actualizar perfil: ' + error.message
            });
        }
    }

    calcularCaloriasObjetivo(tipoMeta, nivelActividad) {
        const { genero, edad, estatura, peso } = this.#datosPerfilTemporal;
        let tmb = 0;

        // Ecuación de Harris-Benedict revisada (Mifflin-St Jeor)
        if (genero === "H") {
            tmb = (10 * peso) + (6.25 * estatura) - (5 * edad) + 5;
        } else {
            tmb = (10 * peso) + (6.25 * estatura) - (5 * edad) - 161;
        }

        let caloriasMantenimiento = tmb * parseFloat(nivelActividad);
        let caloriasObjetivo = caloriasMantenimiento;

        if (tipoMeta === 'perdida') {
            caloriasObjetivo -= 500; // Déficit calórico
        } else if (tipoMeta === 'ganancia') {
            caloriasObjetivo += 500; // Superávit calórico
        }

        return Math.round(caloriasObjetivo);
    }

    async guardarMeta(e) {
        e.preventDefault();
        const tipoMeta = document.getElementById('tipoMeta').value;
        const nivelActividad = document.getElementById('nivelActividad').value;
        const fechaInicio = document.getElementById('fechaInicioMeta').value;
        const fechaFin = document.getElementById('fechaFinMeta').value;

        if(!tipoMeta || !nivelActividad || !fechaInicio || !fechaFin) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos incompletos',
                text: 'Por favor, completa todos los campos de tu meta.'
            });
            return;
        }

        const token = localStorage.getItem("token");
        if(!token) {
            Swal.fire({
                icon: 'error',
                title: 'Sesión no encontrada',
                text: 'No hay sesión activa.'
            });
            return;
        }

        const caloriasCalculadas = this.calcularCaloriasObjetivo(tipoMeta, nivelActividad);

        const datosMeta = {
            tipoDeMetaFisica: tipoMeta,
            caloriasObjetivo: caloriasCalculadas,
            fechaInicio: fechaInicio,
            fechaFin: fechaFin
        };

        try {
            const res = await this.#servicioMetaFisica.crearMetaFisica(token, datosMeta);
            if(res.meta || res.message) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Bienvenido a MatFi!',
                    text: 'Tus metas han sido configuradas (Calorías diarias estimadas: ' + caloriasCalculadas + ' kcal)',
                    confirmButtonText: 'Entrar a la app'
                }).then(() => {
                    window.location.href = "inicioDinamico.html";
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Hubo un problema al guardar tu meta física.'
                });
            }
        } catch(error) {
            console.error("Error al guardar meta:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al crear la meta física: ' + error.message
            });
        }
    }

    async iniciarSesion(e){
        e.preventDefault();

        const correo = document.getElementById("correoElectronicoInicio").value;
        const contrasenia = document.getElementById("contraseniaUsuarioInicio").value;

        if(!correo || !contrasenia){
            Swal.fire({
                icon: 'warning',
                title: 'Campos vacíos',
                text: 'Por favor, ingresa tu correo y contraseña.'
            });
            return;
        }

        const datosFormularioLogin = {
            correoUsuario: correo,
            contraseniaUsuario: contrasenia
        };

        try {
            const res = await this.#servicioUsuario.login(datosFormularioLogin);
            
            if(res && res.token){
                localStorage.setItem("token", res.token);
                if (res.user && res.user.idUsuario) {
                    localStorage.setItem("usuarioId", res.user.idUsuario);
                }
                Swal.fire({
                    icon: 'success',
                    title: '¡Bienvenido de nuevo!',
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    window.location.href = "inicioDinamico.html";
                });
            }else{
                Swal.fire({
                    icon: 'error',
                    title: 'Login fallido',
                    text: 'Credenciales incorrectas o error en el inicio de sesión.'
                });
            }
        } catch (error) {
            console.error("Inicio de sesión inválido", error);
            Swal.fire({
                icon: 'error',
                title: 'Error de acceso',
                text: 'Inicio de sesión inválido. Verifica tus credenciales.'
            });
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new CuentaUsuarioControlador();
});