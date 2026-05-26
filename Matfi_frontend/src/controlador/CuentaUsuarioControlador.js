import Usuario from "../model/Usuario.js";
import CuentaDeUsuario from "../model/CuentaDeUsuario.js";
import UsuarioService from "../services/UsuarioService.js";
import MetaFisicaService from "../services/MetaFisicaService.js";
import CalculadoraCalorias from "../model/CalculadoraCalorias.js";
import MetaFisica from "../model/MetaFisica.js";

class CuentaUsuarioControlador {
    #servicioUsuario;
    #servicioMetaFisica;
    #cuentaUsuario;
    #datosUsuarioTemp;

    constructor(){
        this.#servicioUsuario = new UsuarioService();
        this.#servicioMetaFisica = new MetaFisicaService();
        this.#cuentaUsuario = undefined;
        this.#datosUsuarioTemp = {};

        this.inicializar();
    }

    inicializar() {
        this.recuperarFormularioRegistro();
        this.recuperarFormularioDatosUsuario();
        this.recuperarFormularioMetaFisica();
        this.recuperarFormularioInicioSesion();
    }

    mostrarAlerta(titulo, texto, icono) {
        Swal.fire({
            title: titulo,
            text: texto,
            icon: icono,
            background: '#221b19',
            color: '#eff0e3',
            confirmButtonColor: '#2d2d2d'
        });
    }

    setEstadoBoton(boton, estaCargando, textoOriginal) {
        if (!boton) return;
        const spanTexto = boton.querySelector('.btn-text');
        
        if (estaCargando) {
            boton.classList.add('btn-loading');
            boton.disabled = true;
            if (spanTexto) spanTexto.textContent = "Cargando...";
        } else {
            boton.classList.remove('btn-loading');
            boton.disabled = false;
            if (spanTexto) spanTexto.textContent = textoOriginal;
        }
    }

    recuperarFormularioRegistro(){
        const formularioRegistro = document.getElementById("formularioRegistro");
        if(formularioRegistro){
            formularioRegistro.addEventListener('submit', (e) => {
                this.registrarUsuario(e);
            });
        }
    }

    recuperarFormularioDatosUsuario(){
        const formularioDatos = document.getElementById("formularioDatosUsuario");
        if(formularioDatos){
            formularioDatos.addEventListener('submit', (e) => {
                this.guardarDatosUsuario(e);
            });
        }
    }

    recuperarFormularioMetaFisica(){
        const formularioMeta = document.getElementById("formularioMetaFisicaAcceso");
        if(formularioMeta){
            formularioMeta.addEventListener('submit', (e) => {
                this.guardarMetaFisicaAcceso(e);
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

    async registrarUsuario(e){
        e.preventDefault();
        
        const boton = e.target.querySelector('button[type="submit"]');
        this.setEstadoBoton(boton, true, "Continuar");

        const nombre = document.getElementById('nombreUsuario').value;
        const correo = document.getElementById('correoElectronicoRegistro').value;
        const contrasenia = document.getElementById('contraseniaUsuarioRegistro').value;

        const datosRegistro = {
            nombreUsuario: nombre,
            correoUsuario: correo,
            contraseniaUsuario: contrasenia
        };

        if(!nombre || !correo || !contrasenia){
            this.mostrarAlerta("Error", "Faltan datos de registro", "error");
            this.setEstadoBoton(boton, false, "Continuar");
            return;
        }

        try{
            const res = await this.#servicioUsuario.registrar(datosRegistro);

            if (res.token) {
                localStorage.setItem("token", res.token);
                localStorage.setItem("usuarioId", res.user.idUsuario);

                // Ocultar formulario de registro y mostrar datos de usuario
                document.querySelector('.contenedor__formulario--registro').classList.add('contenedor--oculto');
                document.querySelector('.contenedor__formulario--datos-usuario').classList.remove('contenedor--oculto');
            } else {
                this.mostrarAlerta("Error", res.mensaje || "El registro fue incorrecto", "error");
            }

        } catch (error) {
            console.error("Error en registro:", error);
            this.mostrarAlerta("Error", "Ocurrió un error en el registro", "error");
        } finally {
            this.setEstadoBoton(boton, false, "Continuar");
        }
    }

    async guardarDatosUsuario(e){
        e.preventDefault();

        const boton = e.target.querySelector('button[type="submit"]');
        this.setEstadoBoton(boton, true, "Continuar");

        const genero = document.getElementById('generoUsuario').value;
        const edad = parseInt(document.getElementById('edadUsuario').value);
        const peso = parseFloat(document.getElementById('pesoUsuario').value);
        const altura = parseFloat(document.getElementById('alturaUsuario').value);

        if(!genero || isNaN(edad) || isNaN(peso) || isNaN(altura)){
            this.mostrarAlerta("Error", "Por favor completa todos tus datos personales", "error");
            this.setEstadoBoton(boton, false, "Continuar");
            return;
        }

        const datosActualizar = {
            edadUsuario: edad,
            generoUsuario: genero,
            estaturaUsuario: altura,
            pesoUsuario: peso
        };

        // Guardar temporalmente para la calculadora
        this.#datosUsuarioTemp = { ...datosActualizar };

        try {
            const token = localStorage.getItem("token");
            await this.#servicioUsuario.actualizarPerfil(token, datosActualizar);

            // Ocultar datos de usuario y mostrar meta física
            document.querySelector('.contenedor__formulario--datos-usuario').classList.add('contenedor--oculto');
            document.querySelector('.contenedor__formulario--meta-fisica').classList.remove('contenedor--oculto');

        } catch (error) {
            console.error("Error al guardar datos:", error);
            this.mostrarAlerta("Error", "No se pudieron guardar tus datos personales", "error");
        } finally {
            this.setEstadoBoton(boton, false, "Continuar");
        }
    }

    async guardarMetaFisicaAcceso(e){
        e.preventDefault();

        const boton = e.target.querySelector('button[type="submit"]');
        this.setEstadoBoton(boton, true, "Finalizar");

        const objetivoInput = document.querySelector('input[name="objetivoFisico"]:checked');
        const actividadInput = document.querySelector('input[name="nivelActividad"]:checked');

        if(!objetivoInput || !actividadInput){
            this.mostrarAlerta("Error", "Por favor selecciona tu objetivo y nivel de actividad", "error");
            this.setEstadoBoton(boton, false, "Finalizar");
            return;
        }

        const objetivo = objetivoInput.value;
        const actividad = actividadInput.value;

        try {
            const token = localStorage.getItem("token");

            // Calcular
            const calculadora = new CalculadoraCalorias(objetivo, actividad);
            calculadora.calcularCaloriasDiarias({
                peso: this.#datosUsuarioTemp.pesoUsuario,
                estatura: this.#datosUsuarioTemp.estaturaUsuario,
                edad: this.#datosUsuarioTemp.edadUsuario,
                genero: this.#datosUsuarioTemp.generoUsuario
            });

            const metaFisica = new MetaFisica(
                calculadora.caloriasNecesarias,
                new Date(),
                objetivo
            );

            const datosMetaFisica = {
                tipoDeMetaFisica: metaFisica.objetivoActivo,
                caloriasObjetivo: Math.round(metaFisica.obtenerCaloriasObjetivo),
                fechaInicio: metaFisica.fechaInicio.toISOString().split("T")[0],
                fechaFin: metaFisica.fechaFinalizacion.toISOString().split("T")[0]
            };

            await this.#servicioMetaFisica.crearMetaFisica(token, datosMetaFisica);

            Swal.fire({
                title: "¡Todo listo!",
                text: "Tu perfil ha sido configurado.",
                icon: "success",
                background: '#221b19',
                color: '#eff0e3',
                confirmButtonColor: '#2d2d2d',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                window.location.href = "inicioDinamico.html";
            });

        } catch (error) {
            console.error("Error al guardar meta:", error);
            this.mostrarAlerta("Error", "No se pudo guardar tu meta física", "error");
            this.setEstadoBoton(boton, false, "Finalizar");
        }
    }

    async iniciarSesion(e){
        e.preventDefault();

        const boton = e.target.querySelector('button[type="submit"]');
        this.setEstadoBoton(boton, true, "Comenzar");

        const correo = document.getElementById("correoElectronicoInicio").value;
        const contrasenia = document.getElementById("contraseniaUsuarioInicio").value;

        if(!correo || !contrasenia){
            this.mostrarAlerta("Error", "Faltan datos de inicio de sesión", "error");
            this.setEstadoBoton(boton, false, "Comenzar");
            return;
        }

        const datosFormularioLogin = {
            correoUsuario: correo,
            contraseniaUsuario: contrasenia
        };

        try {
            const res = await this.#servicioUsuario.login(datosFormularioLogin);
            console.log("RESPUESTA LOGIN:", res);

            if(res && res.token){
                localStorage.setItem("token", res.token);
                localStorage.setItem("usuarioId", res.user.idUsuario);

                window.location.href = "inicioDinamico.html";
            }else{
                this.mostrarAlerta("Error", res.error || "Inicio de sesión incorrecto", "error");
                this.setEstadoBoton(boton, false, "Comenzar");
            }
        } catch (error) {
            console.log("inicio de sesión inválido", error);
            this.mostrarAlerta("Error", "Credenciales incorrectas o error en el servidor", "error");
            this.setEstadoBoton(boton, false, "Comenzar");
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new CuentaUsuarioControlador();
});
