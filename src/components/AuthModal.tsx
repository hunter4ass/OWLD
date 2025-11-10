import React, { useState } from "react";
import { X, User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { User as UserType } from "../types";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase";
import { UserService } from "../services/userService";
import { ValidationUtils } from "../utils/validation";

interface AuthModalProps {
  mode: "login" | "register";
  onClose: () => void;
  onLogin: (user: UserType) => void;
  onModeChange: (mode: "login" | "register") => void;
}

const AuthModal: React.FC<AuthModalProps> = ({
  mode,
  onClose,
  onLogin,
  onModeChange,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Валидация в реальном времени
    let validation: { isValid: boolean; message: string };
    switch (name) {
      case 'name':
        if (mode === 'register') {
          validation = ValidationUtils.validateName(value);
          setErrors(prev => ({ ...prev, name: validation.isValid ? '' : validation.message }));
        }
        break;
      case 'email':
        // Простая валидация email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValidEmail = emailRegex.test(value);
        setErrors(prev => ({ 
          ...prev, 
          email: isValidEmail || !value ? '' : 'Введите корректный email' 
        }));
        break;
      case 'password':
        const isValidPassword = value.length >= 6;
        setErrors(prev => ({ 
          ...prev, 
          password: isValidPassword || !value ? '' : 'Пароль должен содержать минимум 6 символов' 
        }));
        break;
      case 'confirmPassword':
        if (mode === 'register') {
          const isMatch = value === formData.password;
          setErrors(prev => ({ 
            ...prev, 
            confirmPassword: isMatch || !value ? '' : 'Пароли не совпадают' 
          }));
        }
        break;
    }
  };

  const isFormValid = () => {
    if (mode === 'register') {
      return (
        formData.name.trim() !== '' &&
        formData.email.trim() !== '' &&
        formData.password.length >= 6 &&
        formData.confirmPassword === formData.password &&
        !errors.name &&
        !errors.email &&
        !errors.password &&
        !errors.confirmPassword
      );
    } else {
      return (
        formData.email.trim() !== '' &&
        formData.password.length >= 6 &&
        !errors.email &&
        !errors.password
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let userCredential;

      if (mode === "register") {
        if (formData.password !== formData.confirmPassword) {
          alert("Пароли не совпадают");
          setLoading(false);
          return;
        }

        userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        // Создаем запись пользователя в Firestore
        await UserService.createUser({
          id: userCredential.user.uid,
          name: formData.name,
          email: formData.email,
        });

        const user: UserType = {
          id: userCredential.user.uid,
          name: formData.name,
          email: formData.email,
        };

        onLogin(user);
      } else {
        userCredential = await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        // Получаем данные пользователя из Firestore
        const userData = await UserService.getUser(userCredential.user.uid);

      const user: UserType = {
        id: userCredential.user.uid,
          name: userData?.name || "Пользователь",
        email: userCredential.user.email || "",
      };

      onLogin(user);
      }

      onClose();
    } catch (error: any) {
      if (error?.code === 'auth/email-already-in-use') {
        alert('Этот email уже зарегистрирован. Переходим на форму входа.');
        onModeChange('login');
      } else if (error?.code === 'auth/invalid-credential') {
        alert('Неверный email или пароль. Проверьте данные и попробуйте снова.');
      } else {
        alert(`Ошибка: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-xl sm:rounded-2xl p-6 sm:p-8 w-full max-w-sm sm:max-w-md border border-gray-700 shadow-2xl">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {mode === "login" ? "Вход в аккаунт" : "Регистрация"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Имя
              </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white text-sm sm:text-base ${
                  errors.name ? 'border-red-500' : 'border-gray-600'
                }`}
                  placeholder="Введите ваше имя"
                  required
                />
              {errors.name && (
                <p className="text-red-400 text-xs sm:text-sm mt-1">{errors.name}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white text-sm sm:text-base ${
                errors.email ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="example@email.com"
                required
              />
            {errors.email && (
              <p className="text-red-400 text-xs sm:text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Пароль
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white text-sm sm:text-base ${
                  errors.password ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Введите пароль"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-xs sm:text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {mode === "register" && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Подтвердите пароль
              </label>
                <input
                type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white text-sm sm:text-base ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
                }`}
                  placeholder="Повторите пароль"
                  required
                />
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs sm:text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !isFormValid()}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-orange-500 text-white font-medium rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span className="text-sm sm:text-base">Загрузка...</span>
              </div>
            ) : mode === "login" ? (
              "Войти"
            ) : (
              "Зарегистрироваться"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm sm:text-base">
            {mode === "login" ? "Нет аккаунта?" : "Уже есть аккаунт?"}
            <button
              onClick={() => onModeChange(mode === "login" ? "register" : "login")}
              className="ml-2 text-purple-400 hover:text-purple-300 font-medium"
            >
              {mode === "login" ? "Зарегистрироваться" : "Войти"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
