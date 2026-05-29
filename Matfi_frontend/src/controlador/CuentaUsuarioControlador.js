import Usuario from "../model/Usuario.js";
import CuentaDeUsuario from "../model/CuentaDeUsuario.js";
import UsuarioService from "../services/UsuarioService.js";
import MetaFisicaService from "../services/MetaFisicaService.js";
import CalculadoraCalorias from "../model/CalculadoraCalorias.js";
import MetaFisica from "../model/MetaFisica.js";
import RegistroActividadService from "../services/RegistroActividadService.js";
import RegistroIngestaService from "../services/RegistroIngestaService.js";
import EstadisticasService from "../services/EstadisticasService.js";

class CuentaUsuarioControlador {
    #servicioUsuario;
    #servicioMetaFisica;
    #registroActividadService;
    #registroIngestaService;
    #estadisticasService;
    #cuentaUsuario;
    #datosUsuarioTemp;

    constructor(){
        this.#servicioUsuario = new UsuarioService();
        this.#servicioMetaFisica = new MetaFisicaService();
        this.#registroActividadService = new RegistroActividadService();
        this.#registroIngestaService = new RegistroIngestaService();
        this.#estadisticasService = new EstadisticasService();
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

    /**
     * Verifica si existen los registros diarios y historial para hoy.
     * Si falta alguno lo crea, si falta el historial lo crea.
     * Siempre deja los 3 consistentes: actividad + ingesta + historial.
     * Es el mismo mecanismo que usa InicioDinamicoVista_Controlador.
     */
    async verificarYCrearRegistrosDiarios(token) {
        try {
            const d = new Date();
            const fechaStringHoy = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

            // 1. Buscar si ya existe registro de actividad para hoy
            let idRegActividad = null;
            try {
                const resAct = await this.#registroActividadService.obtenerRegistroPorFecha(token, fechaStringHoy);
                if (resAct && resAct.length > 0) {
                    idRegActividad = resAct[0].id_registro_actividad;
                    console.log("Registro actividad existente:", idRegActividad);
                }
            } catch (err) {
                console.log("Error al buscar registro actividad:", err);
            }

            // 2. Buscar si ya existe registro de ingesta para hoy
            let idRegIngesta = null;
            try {
                const resIng = await this.#registroIngestaService.obtenerRegistroPorFecha(token, fechaStringHoy);
                if (resIng && resIng.length > 0) {
                    idRegIngesta = resIng[0].id_registro_ingesta;
                    console.log("Registro ingesta existente:", idRegIngesta);
                }
            } catch (err) {
                console.log("Error al buscar registro ingesta:", err);
            }

            // 3. Si ya existen ambos, verificar historial
            if (idRegActividad && idRegIngesta) {
                console.log("Ambos registros existen. Verificando historial...");
                let historial = [];
                try {
                    historial = await this.#estadisticasService.obtenerHistorial(token);
                } catch (err) {
                    console.log("Error al obtener historial:", err);
                }

                const historialHoy = historial.find(h => {
                    const fechaH = new Date(h.fecha).toISOString().split('T')[0];
                    return fechaH === fechaStringHoy;
                });

                if (!historialHoy) {
                    console.log("Creando historial faltante...");
                    await this.#estadisticasService.crearHistorial(token, {
                        fecha: fechaStringHoy,
                        idRegistroActividad: idRegActividad,
                        idRegistroIngesta: idRegIngesta
                    });
                    console.log("Historial creado exitosamente");
                } else {
                    console.log("Todo completo para hoy");
                }
                return;
            }

            // 4. Crear lo que falte
            console.log("Faltan registros. Creando lo necesario...");

            if (!idRegActividad) {
                const resAct = await this.#registroActividadService.crearRegistro(token, {
                    fecha: fechaStringHoy,
                    caloriasQuemadas: 0
                });
                idRegActividad = resAct.registro?.id_registro_actividad || resAct.id_registro_actividad;
                console.log("Registro actividad creado:", idRegActividad);
            }

            if (!idRegIngesta) {
                const resIng = await this.#registroIngestaService.crearRegistro(token, {
                    fecha: fechaStringHoy,
                    caloriasConsumidas: 0
                });
                idRegIngesta = resIng.registro?.id_registro_ingesta || resIng.id_registro_ingesta;
                console.log("Registro ingesta creado:", idRegIngesta);
            }

            // Crear historial uniendo ambos
            await this.#estadisticasService.crearHistorial(token, {
                fecha: fechaStringHoy,
                idRegistroActividad: idRegActividad,
                idRegistroIngesta: idRegIngesta
            });
            console.log("Historial creado exitosamente");

        } catch (error) {
            console.error("Error en verificarYCrearRegistrosDiarios:", error);
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
                localStorage.setItem("usuarioId", res.user?.idUsuario || res.user?.id_usuario);

                // Crear registros diarios iniciales (usuario nuevo, seguro no existen)
                await this.verificarYCrearRegistrosDiarios(res.token);

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

        this.#datosUsuarioTemp = { ...datosActualizar };

        try {
            const token = localStorage.getItem("token");
            await this.#servicioUsuario.actualizarPerfil(token, datosActualizar);

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

            const fechaIni = metaFisica.fechaInicio;
            const fechaFin = metaFisica.fechaFinalizacion;

            const datosMetaFisica = {
                tipoDeMetaFisica: metaFisica.objetivoActivo,
                caloriasObjetivo: Math.round(metaFisica.obtenerCaloriasObjetivo),
                fechaInicio: `${fechaIni.getFullYear()}-${String(fechaIni.getMonth() + 1).padStart(2, '0')}-${String(fechaIni.getDate()).padStart(2, '0')}`,
                fechaFin: `${fechaFin.getFullYear()}-${String(fechaFin.getMonth() + 1).padStart(2, '0')}-${String(fechaFin.getDate()).padStart(2, '0')}`
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
                localStorage.setItem("usuarioId", res.user?.idUsuario || res.user?.id_usuario);

                // Verificar/crear registros diarios antes de redirigir
                // Así sea que vaya a inicio, rutinas o alimentación, ya tiene todo consistente
                await this.verificarYCrearRegistrosDiarios(res.token);

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