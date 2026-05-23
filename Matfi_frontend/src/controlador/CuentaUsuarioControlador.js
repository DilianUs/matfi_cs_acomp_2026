import Usuario from "../model/Usuario.js";
import CuentaDeUsuario from "../model/CuentaDeUsuario.js";
import UsuarioService from "../services/UsuarioService.js";
class CuentaUsuarioControlador {
    #servicioUsuario;
    #cuentaUsuario;


    constructor(){
        this.#servicioUsuario = new UsuarioService();
        this.#cuentaUsuario = undefined;

        this.inicializar();
    }

    inicializar() {
        this.recuperarFormularioRegistro();
        this.recuperarFormularioInicioSesion();
    }

    recuperarFormularioRegistro(){
        const formularioRegistro = document.getElementById("formularioRegistro");
        if(formularioRegistro){
            formularioRegistro.addEventListener('submit', (e) => {
                this.registrarUsuario(e);

            });
        }else {
            return console.log("no se encontro el formulario");
        } 
    }

    recuperarFormularioInicioSesion(){
        const formularioInicioSesion = document.getElementById("formularioInicioSesion");
        if(formularioInicioSesion){
            formularioInicioSesion.addEventListener('submit', (e) => {
                // e.preventDefault();
                this.iniciarSesion(e);

            });
        }else {
            return console.log("inicio de sesion erróneo");
        } 
    }

    async registrarUsuario(e){
        e.preventDefault();
        const nombre = document.getElementById('nombreUsuario').value;
        const telefono = document.getElementById('telefonoUsuario').value;
        const correo = document.getElementById('correoElectronicoRegistro').value;
        const contrasenia = document.getElementById('contraseniaUsuarioRegistro').value;

        // console.log(nombre, telefono, correo, contrasenia);
        const datosRegistro = {
            nombreUsuario: nombre,
            // edadUsuario: 18,
            // generoUsuario: "masculino",
            // estaturaUsuario: 170,
            // pesoUsuario: 70,
            correoUsuario: correo,
            contraseniaUsuario: contrasenia
        };

        console.log(datosRegistro);

        if(!nombre || !telefono || !correo || !contrasenia){
            console.log("registro invalido");
        }else {
            this.#cuentaUsuario = new CuentaDeUsuario(nombre, correo, contrasenia, telefono);

            try{
                // const res = await this.#servicioUsuario.registrar(this.#cuentaUsuario);
                const res = await this.#servicioUsuario.registrar(datosRegistro);

                if (res.token) {
                    localStorage.setItem("token", res.token);
                    localStorage.setItem("usuarioId", res.user.idUsuario);

                    window.location.href = "inicioDinamico.html";
                } else {
                    console.error(res.mensaje);
                    alert("Lo sentimos, el registro fue incorrecto");
                }

            } catch (error) {
                console.error("Error en registro:", error);
            }
        }

    }

    async iniciarSesion(e){
        e.preventDefault();

        const correo = document.getElementById("correoElectronicoInicio").value;
        const contrasenia = document.getElementById("contraseniaUsuarioInicio").value;

        if(!correo || !contrasenia){
            console.log("datos faltantes");
        }else{

            const datosFormularioLogin = {
                correoUsuario: correo,
                contraseniaUsuario: contrasenia
            }

            try {

                const res = await this.#servicioUsuario.login(datosFormularioLogin);
                console.log("RESPUESTA LOGIN:", res);

                if(res){
                    localStorage.setItem("token", res.token);
                    localStorage.setItem("usuarioId", res.user.idUsuario);

                    window.location.href = "inicioDinamico.html";
                }else{
                    console.log(res.error);
                }
                
                
            } catch (error) {
                console.log("inicio de sesión inválido", error)
            }
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new CuentaUsuarioControlador();
});
