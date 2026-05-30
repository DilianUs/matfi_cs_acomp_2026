import { describe, it, expect } from "vitest";
import Usuario from "../src/model/Usuario";

describe("Usuario - Model", () => {

    it("debe crear un usuario correctamente", () => {

        const user = new Usuario(20, "F", 1.65, 60);

        expect(user.mostrarUsuario()).toContain("edad: 20");
        expect(user.mostrarUsuario()).toContain("genero: F");

    });

    it("debe actualizar peso", () => {

        const user = new Usuario(20, "F", 1.65, 60);

        user.actualizarPeso(65);

        expect(user.mostrarUsuario()).toContain("65");

    });

});