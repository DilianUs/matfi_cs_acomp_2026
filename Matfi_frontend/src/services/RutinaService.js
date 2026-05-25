const BASE_URL = "https://matfi-cs-acomp-2026.vercel.app/api";

export default class RutinaService {

    async obtenerRutinas() {

        const token = localStorage.getItem("token");

        const res = await fetch(`${BASE_URL}/rutinas`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();

        if(!res.ok){
            throw new Error(data.error);
        }

        return data;
    }
}