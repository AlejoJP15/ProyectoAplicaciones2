import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css"; // Importa el archivo CSS

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false); // Estado para controlar el modal
  const navigate = useNavigate();

  const isEmailValid = (email) => /^[^@]+@[^@]+\.[^@]+$/.test(email);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !password) {
      setError("Por favor completa todos los campos");
      setIsLoading(false);
      return;
    }

    if (!isEmailValid(email)) {
      setError("Por favor ingresa un correo válido");
      setIsLoading(false);
      return;
    }

    try {
      const dispositivo = navigator.userAgent;
      const canal = "web";

      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, dispositivo, canal }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Error desconocido al iniciar sesión");
        setIsLoading(false);
        return;
      }

      if (data.success) {
        localStorage.setItem("id_sesion", data.id_sesion);
        localStorage.setItem("nombre_usuario", data.nombre);
        localStorage.setItem("role", data.rol);

        setIsModalVisible(true); // Mostrar modal de éxito

        setTimeout(() => {
          if (data.rol === "admin") {
            window.location.href = `http://localhost:3000/menu_admin?session_id=${data.id_sesion}&nombre_usuario=${encodeURIComponent(
              data.nombre
            )}&role=${encodeURIComponent(data.rol)}`;
          } else {
            window.location.href = `http://localhost:3000/menu_usuario?session_id=${data.id_sesion}&nombre_usuario=${encodeURIComponent(
              data.nombre
            )}&role=${encodeURIComponent(data.rol)}`;
          }
        }, 3000); // Redirige después de 3 segundos
      }
    } catch (err) {
      setError("Error al conectar con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Modal de inicio de sesión exitoso */}
      {isModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-bold text-green-600 mb-4">
              ¡Inicio de Sesión Exitoso!
            </h2>
            <p className="text-gray-700 mb-6">
              Redirigiendo a tu menú principal.
            </p>
          </div>
        </div>
      )}

      <div className="absolute top-10 text-center">
        <h1 className="text-3xl font-bold text-gray-800">
          Sistema de Chatbot con Reconocimiento Emocional
        </h1>
      </div>

      {/* Logo centrado */}
      <div className="logo-container">
        <img
          src="/Logo.webp" // Asegúrate de que esta ruta sea correcta
          alt="Logo"
          className="logo"
        />
      </div>

      {/* Contenedor del Login */}
      <div className="login-box">
        <h2 className="login-title">Iniciar Sesión</h2>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleLogin} className="login-form">
          <input
            type="email"
            placeholder="Correo"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            className="login-input"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            className="login-input"
            required
          />
          <button
            type="submit"
            className={`login-button ${
              isLoading ? "button-loading" : "button-active"
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Cargando..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className="login-links">
          <button onClick={() => navigate("/register")} className="link">
            ¿Primera vez? Regístrese
          </button>
          <a href="/forgot-password" className="link">
            ¿Olvidó su contraseña?
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;
