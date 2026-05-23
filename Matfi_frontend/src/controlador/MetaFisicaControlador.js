import MetaFisica from "../model/MetaFisica.js";
import CalculadoraCalorias from "../model/CalculadoraCalorias.js";

export default class MetaFisicaControlador {
    // atributos
    

    constructor(){


    }

    // recuperar datos del formulario
    obtenerDatoActividad(){
        const objetivoFisico = document.querySelector('input[name="objetivo"]:checked');
        return objetivoFisico ? objetivoFisico.value : null;
    }

    obtenerDatoObjetivoFisico(){
        const objFisico = document.getElementById("nivelActividad");
        return objFisico ? objFisico.value : null;
    }

    

    // recuperar informacion de usuario

    //calcular meta fisica
}

new MetaFisicaControlador();