export default class CuentaDeUsuario {
    //atributos
    #correoCuenta;
    #contraseniaCuenta;
    #telefonoCuenta;
    #nombreUsuario;
    #usuarioDelSistema;

    constructor(nombreUsuario, correoCuenta, contraseniaCuenta, telefonoCuenta, usuarioDelSistema){
        this.nombreUsuario = nombreUsuario;
        this.#correoCuenta = correoCuenta;
        this.#contraseniaCuenta = contraseniaCuenta;
        this.#telefonoCuenta = telefonoCuenta;
        this.#usuarioDelSistema = usuarioDelSistema;
    }

    iniciarSesion(correo, contrasenia){
        // if(this.#correoCuenta === correo && this.#contraseniaCuenta === contrasenia){
        //     console.log("inicio de sesion exitoso")
        // }else {console.log("No se pudo iniciar sesion")}
        return this.correoCuenta === correo && this.contraseniaCuenta === contrasenia;
    }

    cerrarSesion(){
        console.log("Sesión cerrada");
    }

    actualizarContrasenia(nuevaContrasenia){
        this.#contraseniaCuenta = nuevaContrasenia;
    }

    // validarCredencialesDeAcceso(){

    // }

    //crear metodo para el telefono de la cuenta

    mostrarCuentaUsuario(){
        return `
            correo: ${this.#correoCuenta}
            contrasenia: ${this.#contraseniaCuenta}
            telefono: ${this.#telefonoCuenta}
            usuario: ${this.#usuarioDelSistema}`
    }

    //getters
    get correoCuenta() {
    return this.#correoCuenta;
    }

    get contraseniaCuenta() {
        return this.#contraseniaCuenta;
    }

    get telefonoCuenta() {
        return this.#telefonoCuenta;
    }

    get usuarioDelSistema() {
        return this.#usuarioDelSistema;
    }
}