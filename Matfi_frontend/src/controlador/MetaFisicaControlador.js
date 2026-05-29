import MetaFisica from "../model/MetaFisica.js";
import CalculadoraCalorias from "../model/CalculadoraCalorias.js";
import UsuarioService from "../services/UsuarioService.js";
import MetaFisicaService from "../services/MetaFisicaService.js";

export default class MetaFisicaControlador {

    #refFormularioMetaFisica;
    #usuarioService;
    #calculadora;
    #metaFisicaService;

    constructor(){

        this.#refFormularioMetaFisica = document.getElementById("formularioMetaFisica");
        this.#usuarioService = new UsuarioService();
        this.#calculadora = null;
        this.#metaFisicaService = new MetaFisicaService();

        this.inicializarEventos();
    }

    inicializarEventos(){

        this.#refFormularioMetaFisica.addEventListener("submit", async (e) => {

            e.preventDefault();

            const datosFormulario = this.recuperarDatosFormulario();

            if(!datosFormulario){
                return;
            }

            const datosUsuario = await this.recuperarDatosUsuario();
            if(!datosUsuario){
                return;
            }

            await this.verificarMetaFisicaExistente();
            
            const metaFisica = await this.calcularMetaFisica(datosFormulario,datosUsuario);
            await this.guardarMetaFisica(metaFisica);
            console.log(metaFisica);
        });
    }

    // recuperar datos formulario
    recuperarDatosFormulario(){

        const objetivoFisico = document.querySelector('input[name="objetivoFisico"]:checked');
        const nivelActividad = document.querySelector('input[name="nivelActividad"]:checked');

        if(!objetivoFisico || !nivelActividad){

            alert("Debes seleccionar un objetivo físico y un nivel de actividad");

            return null;
        }

        return {
            objetivoFisico: objetivoFisico.value,
            nivelActividad: nivelActividad.value
        };
    }

    // recuperar datos usuario
    async recuperarDatosUsuario(){
        try {

            const token = localStorage.getItem("token");

            if(!token){
                alert("No existe una sesión iniciada");
                return null;
            }

            const datosUsuarioResp = await this.#usuarioService.obtenerPerfil(token);
            console.log(datosUsuarioResp)

            const {
                edadUsuario,
                generoUsuario,
                estaturaUsuario,
                pesoUsuario
            } = datosUsuarioResp;

            if(!edadUsuario || !generoUsuario || !estaturaUsuario || !pesoUsuario){
                alert("Te faltan tus datos de peso, edad, género o estatura");
                return null;
            }

            return {
                edadUsuario,
                generoUsuario,
                estaturaUsuario,
                pesoUsuario
            };

        } catch (error) {

            console.log("Error al recuperar usuario", error);

            return null;
        }
    }

    async verificarMetaFisicaExistente(){

        try {

            const token = localStorage.getItem("token");

            const metasFisicas =
                await this.#metaFisicaService.obtenerMetasFisicas(token);

            if(metasFisicas.length === 0){
                return;
            }

            const ultimaMeta =
                metasFisicas[metasFisicas.length - 1];

            await this.#metaFisicaService.eliminarMetaFisica(
                token,
                ultimaMeta.id_meta
            );

            console.log("Meta física anterior eliminada");

        } catch(error){

            console.log(
                "Error verificando metas físicas",
                error
            );
        }
    }

    async calcularMetaFisica(datosFormulario, datosUsuario){

        this.#calculadora = new CalculadoraCalorias(
            datosFormulario.objetivoFisico,
            datosFormulario.nivelActividad
        );

        this.#calculadora.calcularCaloriasDiarias({
            peso: datosUsuario.pesoUsuario,
            estatura: datosUsuario.estaturaUsuario,
            edad: datosUsuario.edadUsuario,
            genero: datosUsuario.generoUsuario === "Masculino"
                ? "M"
                : "F"
        });

        return new MetaFisica(
            this.#calculadora.caloriasNecesarias,
            new Date(),
            datosFormulario.objetivoFisico
        );
    }

    async guardarMetaFisica(metaFisica){

        const token = localStorage.getItem("token");

        const fechaIni = metaFisica.fechaInicio;
        const fechaFin = metaFisica.fechaFinalizacion;

        const datosMetaFisica = {
            tipoDeMetaFisica: metaFisica.objetivoActivo,
            caloriasObjetivo: Math.round(metaFisica.obtenerCaloriasObjetivo),
            fechaInicio: `${fechaIni.getFullYear()}-${String(fechaIni.getMonth() + 1).padStart(2, '0')}-${String(fechaIni.getDate()).padStart(2, '0')}`,
            fechaFin: `${fechaFin.getFullYear()}-${String(fechaFin.getMonth() + 1).padStart(2, '0')}-${String(fechaFin.getDate()).padStart(2, '0')}`
        };

        try {

            const respuesta =
                await this.#metaFisicaService.crearMetaFisica(
                    token,
                    datosMetaFisica
                );

            console.log(respuesta);

            alert(
                `Meta física creada correctamente.
                Calorías objetivo:
                ${Math.round(metaFisica.obtenerCaloriasObjetivo)}`
            );

        } catch(error){

            console.log(
                "Error al crear meta física",
                error
            );

            alert("No se pudo guardar la meta física");
        }
    }


    // calcular meta física
    // async calcularMetaFisica(datosFormulario, datosUsuario){

    //     this.#calculadora = new CalculadoraCalorias(
    //         datosFormulario.objetivoFisico,
    //         datosFormulario.nivelActividad
    //     );

    //     this.#calculadora.calcularCaloriasDiarias({
    //         peso: datosUsuario.pesoUsuario,
    //         estatura: datosUsuario.estaturaUsuario,
    //         edad: datosUsuario.edadUsuario,
    //         genero: datosUsuario.generoUsuario === "Masculino" ? "M" : "F"
    //     });

    //     const metaFisica = new MetaFisica(
    //         this.#calculadora.caloriasNecesarias,
    //         new Date(),
    //         datosFormulario.objetivoFisico
    //     );

    //     const token = localStorage.getItem("token");

    //     const datosMetaFisica = {
    //         tipoDeMetaFisica: metaFisica.objetivoActivo,
    //         caloriasObjetivo: Math.round(metaFisica.obtenerCaloriasObjetivo),
    //         fechaInicio: metaFisica.fechaInicio.toISOString().split("T")[0],
    //         fechaFin: metaFisica.fechaFinalizacion.toISOString().split("T")[0]
    //     };

    //     try {

    //         const respuesta = await this.#metaFisicaService.crearMetaFisica(
    //             token,
    //             datosMetaFisica
    //         );

    //         console.log(respuesta);

    //         alert(`Meta física creada correctamente. Calorías objetivo: ${Math.round(metaFisica.obtenerCaloriasObjetivo)}`);

    //     } catch(error){

    //         console.log("Error al crear meta física", error);

    //         alert("No se pudo guardar la meta física");
    //     }

    //     return metaFisica;
    // }
}
