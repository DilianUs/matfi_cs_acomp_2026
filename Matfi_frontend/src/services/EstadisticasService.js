const BASE_URL = "https://matfi-cs-acomp-2026.vercel.app/api";

export default class EstadisticasService {

    async obtenerHistorial(token) {
        const res = await fetch(`${BASE_URL}/estadisticas/historial`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || "Error al obtener historial");
        }

        return data;
    }

    async crearHistorial(token, datos) {
        const res = await fetch(`${BASE_URL}/estadisticas/historial`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(datos)
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || "Error al crear historial");
        }

        return data;
    }
}