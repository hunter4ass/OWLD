export interface ValidationResult {
  isValid: boolean;
  message: string;
}

export class ValidationUtils {
  // Валидация имени - только буквы, пробелы и дефисы
  static validateName(name: string): ValidationResult {
    if (!name.trim()) {
      return { isValid: false, message: 'Имя обязательно для заполнения' };
    }
    
    if (name.length < 2) {
      return { isValid: false, message: 'Имя должно содержать минимум 2 символа' };
    }
    
    if (name.length > 50) {
      return { isValid: false, message: 'Имя не должно превышать 50 символов' };
    }
    
    // Только буквы, пробелы, дефисы и апострофы
    const nameRegex = /^[а-яёa-z\s\-']+$/i;
    if (!nameRegex.test(name)) {
      return { isValid: false, message: 'Имя должно содержать только буквы, пробелы, дефисы и апострофы' };
    }
    
    return { isValid: true, message: '' };
  }

  // Валидация телефона - российский формат
  static validatePhone(phone: string): ValidationResult {
    if (!phone.trim()) {
      return { isValid: false, message: 'Номер телефона обязателен для заполнения' };
    }
    
    // Убираем все символы кроме цифр
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length !== 11) {
      return { isValid: false, message: 'Номер телефона должен содержать 11 цифр' };
    }
    
    // Проверяем, что номер начинается с 7 или 8
    if (!cleanPhone.match(/^[78]/)) {
      return { isValid: false, message: 'Номер телефона должен начинаться с 7 или 8' };
    }
    
    return { isValid: true, message: '' };
  }

  // Валидация адреса - должен содержать и буквы, и цифры
  static validateAddress(address: string): ValidationResult {
    if (!address.trim()) {
      return { isValid: false, message: 'Адрес обязателен для заполнения' };
    }
    
    if (address.length < 10) {
      return { isValid: false, message: 'Адрес должен содержать минимум 10 символов' };
    }
    
    if (address.length > 200) {
      return { isValid: false, message: 'Адрес не должен превышать 200 символов' };
    }
    
    // Проверяем наличие букв
    const hasLetters = /[а-яёa-z]/i.test(address);
    if (!hasLetters) {
      return { isValid: false, message: 'Адрес должен содержать буквы' };
    }
    
    // Проверяем наличие цифр
    const hasNumbers = /\d/.test(address);
    if (!hasNumbers) {
      return { isValid: false, message: 'Адрес должен содержать цифры (номер дома, квартиры и т.д.)' };
    }
    
    // Проверяем на недопустимые символы
    const invalidChars = /[<>{}[\]\\|`~!@#$%^&*+=]/;
    if (invalidChars.test(address)) {
      return { isValid: false, message: 'Адрес содержит недопустимые символы' };
    }
    
    return { isValid: true, message: '' };
  }

  // Форматирование телефона для отображения
  static formatPhone(phone: string): string {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 11) {
      return `+7 (${cleanPhone.slice(1, 4)}) ${cleanPhone.slice(4, 7)}-${cleanPhone.slice(7, 9)}-${cleanPhone.slice(9)}`;
    }
    return phone;
  }

  // Общая валидация формы заказа
  static validateOrderForm(data: { name: string; phone: string; address: string }): ValidationResult {
    const nameValidation = this.validateName(data.name);
    if (!nameValidation.isValid) {
      return nameValidation;
    }

    const phoneValidation = this.validatePhone(data.phone);
    if (!phoneValidation.isValid) {
      return phoneValidation;
    }

    const addressValidation = this.validateAddress(data.address);
    if (!addressValidation.isValid) {
      return addressValidation;
    }

    return { isValid: true, message: '' };
  }
} 