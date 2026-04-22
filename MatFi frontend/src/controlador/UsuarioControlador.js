import CuentaDeUsuario from "../model/CuentaDeUsuario.js";
import Usuario from "../model/Usuario.js";

class UsuarioControlador {

    static recuperarFormularioRegistro(){
        document.getElementById('formularioRegistro').addEventListener('submit', UsuarioControlador.registrarUsuario); //this.registrarUsuario
    }

    static recuperarFormularioInicioSesion(){
        document.getElementById('formularioInicioSesion').addEventListener('submit', UsuarioControlador.iniciarSesion); //this.registrarUsuario
    } 

    //registro de usuarios
    static async registrarUsuario(e) {
        e.preventDefault();

        //valores del formulario
        const nombre = document.getElementById('nombreUsuario').value;
        const telefono = document.getElementById('telefonoUsuario').value;
        const correo = document.getElementById('correoElectronicoRegistro').value;
        const contrasenia = document.getElementById('contraseniaUsuarioRegistro').value;

        //creacion de la cuenta
        const nuevoUsuario = new Usuario(nombre);
        const nuevaCuenta = new CuentaDeUsuario(correo, contrasenia, telefono, nuevoUsuario);
        console.log("Formulario enviado");

        // const { nombreUsuario, edadUsuario, generoUsuario, estaturaUsuario, pesoUsuario, correoUsuario, contraseniaUsuario } = req.body;
        const datosRegistroUsuario = {
            nombreUsuario: nuevoUsuario.nombreDeUsuario,
            telefonoUsuario: nuevaCuenta.telefonoCuenta,
            correoUsuario: nuevaCuenta.correoCuenta,
            contraseniaUsuario: nuevaCuenta.contraseniaCuenta
        };

        try{

            const res = await fetch("http://localhost:3000/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datosRegistroUsuario)
            });

            const data = await res.json();
            console.log(data);

            if (data.ok) {
                console.log("Registro exitoso");
                window.location.href = "/InicioApp.html";
            } else {
                console.log("Error:", data.mensaje);
            }

        } catch (error) {
            console.error("Error en registro:", error);
        }

        // console.log("Datos enviados:", datos);

    }


    //inicio de sesion
    static async iniciarSesion(e) {
        e.preventDefault();

        //valores del formulario
        const correo = document.getElementById('correoElectronicoInicio').value;
        const contrasenia = document.getElementById('contraseniaUsuarioInicio').value;

        // const { nombreUsuario, edadUsuario, generoUsuario, estaturaUsuario, pesoUsuario, correoUsuario, contraseniaUsuario } = req.body;
        const datosInicioSesion = {
            correoUsuario: correo,
            contraseniaUsuario: contrasenia
        };

       try {
            const res = await fetch("http://localhost:3000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datosInicioSesion)
            });

            const data = await res.json();

            if (data.ok) {
                window.location.href = "/InicioApp.html";
            } else {
                console.log("Error:", data.mensaje);
            }

        } catch (error) {
            console.error("Error de conexión:", error);
        }

        // console.log("Datos enviados:", datos);

    }
}

document.addEventListener("DOMContentLoaded", () => {
    UsuarioControlador.recuperarFormularioRegistro();
    UsuarioControlador.recuperarFormularioInicioSesion();
});


