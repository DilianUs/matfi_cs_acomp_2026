const BASE_URL = "https://matfi-cs-acomp-2026.vercel.app/api";

export default class RecetaService {
    
    async obtenerRecetas(token){

        const res = await fetch(`${BASE_URL}/recetas`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }   
        });

        const listaRecetas = await res.json();

        if (!res.ok) {
            throw new Error(listaRecetas.error || "Error al obtener recetas");
        }

        console.log("Recetas obtenidas:", listaRecetas);

        return listaRecetas;
    }
}