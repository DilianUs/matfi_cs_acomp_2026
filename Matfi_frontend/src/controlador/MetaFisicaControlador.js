import MetaFisica from "../model/MetaFisica.js";
import CalculadoraCalorias from "../model/CalculadoraCalorias.js";
import UsuarioService from "../services/UsuarioService.js";
import MetaFisicaService from "../services/MetaFisicaService.js";

export default class MetaFisicaControlador {

    #refFormularioMetaFisica;
    #usuarioService;
    #calculadora;
    #metaFisicaService;
    #esActualizacion;
    #idMetaAActualizar;

    constructor(){

        this.#refFormularioMetaFisica = document.getElementById("formularioMetaFisica");
        this.#usuarioService = new UsuarioService();
        this.#calculadora = null;
        this.#metaFisicaService = new MetaFisicaService();
        this.#esActualizacion = false;
        this.#idMetaAActualizar = null;

        this.inicializarEventos();
    }

    init() {
        this.#refFormularioMetaFisica = document.getElementById("formularioMetaFisica") || this.#refFormularioMetaFisica;
        this.configurarBotonesApertura();
    }

    configurarBotonesApertura() {
        // En perfilVista.html tenemos dos botones:
        // btnAbrirModalObjetivo (Crear/Establecer)
        // btnAbrirModalActualizarObjetivo (Actualizar)

        const btnCrear = document.getElementById("btnAbrirModalObjetivo");
        const btnActualizar = document.getElementById("btnAbrirModalActualizarObjetivo");

        if (btnCrear) {
            btnCrear.addEventListener("click", () => {
                this.#esActualizacion = false;
                this.#idMetaAActualizar = null;
                document.querySelector("#modalMetaFisica h2.apartadoEncabezado__elemento").textContent = "Define tu objetivo";
                this.#refFormularioMetaFisica.reset();
                document.getElementById("modalMetaFisica").classList.add("activo");
            });
        }

        if (btnActualizar) {
            btnActualizar.addEventListener("click", async () => {
                const token = localStorage.getItem("token");
                if (!token) return;

                try {
                    const metas = await this.#metaFisicaService.obtenerMetasFisicas(token);
                    if (metas.length === 0) {
                        alert("No tienes una meta física establecida actualmente. Por favor establece una primero.");
                        return;
                    }
                    
                    const metaActual = metas[metas.length - 1];
                    this.#esActualizacion = true;
                    this.#idMetaAActualizar = metaActual.id_meta;

                    document.querySelector("#modalMetaFisica h2.apartadoEncabezado__elemento").textContent = "Actualiza tu objetivo";
                    
                    // Prellenar form si es posible
                    if(metaActual.tipo_meta) {
                        const radio = document.querySelector(`input[name="objetivoFisico"][value="${metaActual.tipo_meta}"]`);
                        if(radio) radio.checked = true;
                    }

                    document.getElementById("modalMetaFisica").classList.add("activo");

                } catch (error) {
                    console.log("Error obteniendo metas para actualizar:", error);
                    alert("Error al cargar la información de tu meta actual.");
                }
            });
        }
    }

    inicializarEventos(){

        if (this.#refFormularioMetaFisica) {
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

                const metaFisica = await this.calcularMetaFisica(datosFormulario,datosUsuario);
                
                if (this.#esActualizacion && this.#idMetaAActualizar) {
                    await this.actualizarMetaFisica(metaFisica, this.#idMetaAActualizar);
                } else {
                    await this.verificarMetaFisicaExistente();
                    await this.guardarMetaFisica(metaFisica);
                }
                
                console.log(metaFisica);
            });
        }
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
            
            document.getElementById("modalMetaFisica").classList.remove("activo");

        } catch(error){

            console.log(
                "Error al crear meta física",
                error
            );

            alert("No se pudo guardar la meta física");
        }
    }

    async actualizarMetaFisica(metaFisica, idMeta) {
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
            const respuesta = await this.#metaFisicaService.actualizarMetaFisica(
                token,
                idMeta,
                datosMetaFisica
            );

            console.log("Respuesta actualización:", respuesta);

            alert(
                `Meta física actualizada correctamente.
                Nuevas Calorías objetivo:
                ${Math.round(metaFisica.obtenerCaloriasObjetivo)}`
            );
            
            document.getElementById("modalMetaFisica").classList.remove("activo");
            
            // Refrescar perfil si existe el controlador
            const evt = new CustomEvent('metaFisicaActualizada');
            window.dispatchEvent(evt);

        } catch(error){
            console.log("Error al actualizar meta física", error);
            alert("No se pudo actualizar la meta física");
        }
    }
}
