// Utilidades de validación
class ValidationUtils {
  // Validar email
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validar contraseña (mínimo 8 caracteres)
  static isValidPassword(password) {
    return password && password.length >= 8;
  }

  // Validar que no esté vacío
  static isNotEmpty(value) {
    return value !== null && value !== undefined && value.toString().trim() !== '';
  }

  // Validar número positivo
  static isPositiveNumber(value) {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0;
  }
}

export default ValidationUtils;