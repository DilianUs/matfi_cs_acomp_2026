
export default class RecetaService {
    
    async obtenerReceta(){
        //const token = localStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/recetas`, {
           method: "GET",

            headers: {
                "Authorization": `Bearer ${token}`
            }   

        });
        const listaRecetas = await res.json();

        console.log(listaRecetas);

        return listaRecetas;
    }
}
