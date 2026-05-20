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

  // Validar fecha en formato YYYY-MM-DD
  static isValidDate(dateString) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) {
      return false;
    }
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }
}

export default ValidationUtils;