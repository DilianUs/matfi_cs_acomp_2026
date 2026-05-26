const BASE_URL = "https://matfi-cs-acomp-2026.vercel.app/api";

export default class RegistroIngestaService {

    async crearRegistro(token, datos){

        const res = await fetch(`${BASE_URL}/registrosIngesta`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(datos)
        });

        const data = await res.json();

        if(!res.ok){
            throw new Error(data.error || "Error al crear registro de ingesta");
        }

        return data;
    }

    async agregarReceta(token, registroId, idReceta){

        const res = await fetch(
            `${BASE_URL}/registrosIngesta/${registroId}/recetas`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ idReceta })
            }
        );

        const data = await res.json();

        if(!res.ok){
            throw new Error(data.error || "Error al agregar receta");
        }

        return data;
    }

    async actualizarRegistro(token, id, datos){

        const res = await fetch(
            `${BASE_URL}/registrosIngesta/${id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(datos)
            }
        );

        const data = await res.json();

        if(!res.ok){
            throw new Error(data.error || "Error al actualizar registro de ingesta");
        }

        return data;
    }

    async obtenerRegistroPorFecha(token, fecha){

        const res = await fetch(
            `${BASE_URL}/registrosIngesta/byDate?fecha=${fecha}`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await res.json();

        if(!res.ok){
            throw new Error(data.error || "Error obteniendo registros de ingesta");
        }

        return data;
    }
}