// services/MetaFisicaService.js

const BASE_URL = "https://matfi-cs-acomp-2026.vercel.app/api";

export default class MetaFisicaService {

    async crearMetaFisica(token, datos){

        const res = await fetch(`${BASE_URL}/metaFisica`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(datos)
        });

        const data = await res.json();

        if(!res.ok){
            throw new Error(data.error || "Error al crear meta física");
        }

        return data;
    }

    async obtenerMetasFisicas(token){

        const res = await fetch(`${BASE_URL}/metaFisica`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();

        if(!res.ok){
            throw new Error(data.error || "Error al obtener metas físicas");
        }

        return data;
    }

    async actualizarMetaFisica(token, idMeta, datos){

        const res = await fetch(`${BASE_URL}/metaFisica/${idMeta}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(datos)
        });

        const data = await res.json();

        if(!res.ok){
            throw new Error(data.error || "Error al actualizar meta física");
        }

        return data;
    }

    async eliminarMetaFisica(token, idMeta){

        const res = await fetch(`${BASE_URL}/metaFisica/${idMeta}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();

        if(!res.ok){
            throw new Error(data.error || "Error al eliminar meta física");
        }

        return data;
    }
}