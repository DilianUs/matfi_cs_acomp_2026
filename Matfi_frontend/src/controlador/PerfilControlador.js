import CuentaDeUsuario from "../model/CuentaDeUsuario.js";
import Usuario from "../model/Usuario.js";
import UsuarioService from "../services/UsuarioService.js";

export default class PerfilControlador {
    #usuarioServicio;
    #usuario;

    constructor(){
        this.#usuarioServicio = new UsuarioService();
        this.#usuario = undefined;
    }

    recuperarDatosUsuario(){
        const genero = document.getElementById("generoUsuario").value;
        const edad = document.getElementById("edadUsuario").value;
        const altura = document.getElementById("alturaUsuario").value;
        const peso = document.getElementById("pesoUsuario").value;

        if(!genero || !edad || !altura || !peso){
            console.log("Datos incompletos");
            return false;
        }
        else if((Number.isInteger(edad) && edad > 0 ) && (altura > 130) && (peso > 30)){
            this.#usuario = new Usuario(edad, genero, altura, peso);
        }else{
            console.log("datos invalidos");
        }
    }

    GuardarDatosUsuario(){
        const usuarioId = localStorage.getItem("usuarioId");

        if(!usuarioId){
            console.log("No hay usuario logueado");
            return;
        }

        try {
            const res = await this.#usuarioServicio.actualizarPerfil(usuarioId, datos);

            if(res.ok){
                console.log("Perfil actualizado correctamente");
            } else {
                console.log(res.mensaje);
            }

        } catch (error) {
            console.log("Error al guardar perfil:", error);
        }
    }
}

new PerfilControlador();

