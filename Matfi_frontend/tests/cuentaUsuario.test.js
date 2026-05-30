import { describe, it, expect } from "vitest";
import CuentaDeUsuario from "../src/model/CuentaDeUsuario";

describe("CuentaDeUsuario - Model", () => {

    it("debe iniciar sesión correctamente", () => {

        const cuenta = new CuentaDeUsuario(
            "Cecilia",
            "test@mail.com",
            "1234",
            "9999999999",
            "usuarioSistema"
        );

        const login = cuenta.iniciarSesion("test@mail.com", "1234");

        expect(login).toBe(true);

    });

    it("debe fallar el login con credenciales incorrectas", () => {

        const cuenta = new CuentaDeUsuario(
            "Cecilia",
            "test@mail.com",
            "1234",
            "9999999999",
            "usuarioSistema"
        );

        const login = cuenta.iniciarSesion("mal@mail.com", "0000");

        expect(login).toBe(false);

    });

    it("debe actualizar contraseña", () => {

        const cuenta = new CuentaDeUsuario(
            "Cecilia",
            "test@mail.com",
            "1234",
            "9999999999",
            "usuarioSistema"
        );

        cuenta.actualizarContrasenia("nueva123");

        expect(cuenta.contraseniaCuenta).toBe("nueva123");

    });

});