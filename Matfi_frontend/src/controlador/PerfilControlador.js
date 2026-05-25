// import CuentaDeUsuario from "../model/CuentaDeUsuario.js";
// import Usuario from "../model/Usuario.js";
// import UsuarioService from "../services/UsuarioService.js";

import UsuarioService from "../services/UsuarioService.js";

export default class PerfilControlador {

    #usuarioServicio;

    constructor(){
        this.#usuarioServicio = new UsuarioService();
        this.inicializar();
    }

    inicializar(){
        this.recuperarFormularioDatosUsuario();
        this.cargarTarjetaUsuario();
    }

    recuperarFormularioDatosUsuario(){

        const formularioDatosUsuario = document.getElementById("formPerfil");

        if(!formularioDatosUsuario){
            return;
        }

        formularioDatosUsuario.addEventListener("submit", (e) => {
            this.actualizarDatosUsuario(e);
        });
    }

    async actualizarDatosUsuario(e){

        e.preventDefault();
        const nombre = document.getElementById("nombreUsuario").value;
        const genero = document.getElementById("generoUsuario").value;
        const edad = document.getElementById("edadUsuario").value;
        const altura = document.getElementById("alturaUsuario").value;
        const peso = document.getElementById("pesoUsuario").value;

        if(!genero || !edad || !altura || !peso){
            alert("Todos los datos son obligatorios");
            return;
        }

        if(edad <= 0 || altura <= 0 || peso <= 0){
            alert("Datos inválidos");
            return;
        }

        const datos = {
            nombreUsuario: nombre,
            generoUsuario: genero,
            edadUsuario: Number(edad),
            estaturaUsuario: Number(altura),
            pesoUsuario: Number(peso)
        };

        const token = localStorage.getItem("token");

        if(!token){
            alert("No hay sesión iniciada");
            return;
        }

        try {

            const respuesta = await this.#usuarioServicio.actualizarPerfil(token, datos);

            console.log(respuesta);

            alert("Perfil actualizado correctamente");

            this.cargarTarjetaUsuario();

        } catch(error){

            console.log("Error al actualizar perfil", error);

            alert("No se pudo actualizar el perfil");
        }
    }

    async cargarTarjetaUsuario(){

        try {

            const token = localStorage.getItem("token");

            if(!token){
                return;
            }

            const perfil = await this.#usuarioServicio.obtenerPerfil(token);

            console.log(perfil);

            const nombre = document.getElementById("nombreUsuarioTexto");
            const id = document.getElementById("idUsuario");
            const genero = document.getElementById("generoUsuarioTexto");
            const altura = document.getElementById("alturaUsuarioTexto");
            const peso = document.getElementById("pesoUsuarioTexto");

            if(!nombre || !id || !genero || !altura || !peso){
                return;
            }

            nombre.textContent = perfil.nombreUsuario || "Sin nombre";
            id.textContent = `ID: ${perfil.idUsuario || "N/A"}`;
            genero.textContent = perfil.generoUsuario || "No definido";
            altura.textContent = `${perfil.estaturaUsuario || "-"} m`;
            peso.textContent = `${perfil.pesoUsuario || "-"} kg`;

        } catch(error){

            console.log("Error cargando tarjeta", error);
        }
    }
}

