const BASE_URL = "https://matfi-cs-acomp-2026.vercel.app/api";

export default class RegistroActividadService {

    async crearRegistro(token, datos){

        const res = await fetch(`${BASE_URL}/registrosActividad`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(datos)
        });

        const data = await res.json();

        if(!res.ok){
            throw new Error(data.error || "Error al crear registro");
        }

        return data;
    }

    async agregarRutina(token, registroId, idRutina){

        const res = await fetch(
            `${BASE_URL}/registrosActividad/${registroId}/rutinas`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ idRutina })
            }
        );

        const data = await res.json();

        if(!res.ok){
            throw new Error(data.error || "Error al agregar rutina");
        }

        return data;
    }

    async actualizarRegistro(token, id, datos){

        const res = await fetch(
            `${BASE_URL}/registrosActividad/${id}`,
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
            throw new Error(data.error || "Error al actualizar registro");
        }

        return data;
    }
}