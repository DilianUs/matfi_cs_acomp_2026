// services/UsuarioService.js

const BASE_URL = "https://matfi-cs-acomp-2026.vercel.app/api";

export default class UsuarioService {
    

    async registrar(datos){
        const res = await fetch(`${BASE_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datos)
        });

        if (!res.ok) throw new Error("Error en registro");

        // return await res.json();
        const data = await res.json(); 
        
        console.log("STATUS:", res.status);
        console.log("RESPUESTA BACKEND:", data);

        if (!res.ok) {
            throw new Error(data.error || JSON.stringify(data));
        }

        return data;
    }

    async login(datos){
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datos)
        });

        if (!res.ok) throw new Error("Error en login");

        // return await res.json();
        const data = await res.json();
        return data;
    }

    async actualizarPerfil(usuarioId, datos){
        const res = await fetch(`http://localhost:3000/usuario/${usuarioId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datos)
        });

        return await res.json();
    }
}