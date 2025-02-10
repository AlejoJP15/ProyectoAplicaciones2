// src/components/login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css"; // Asegúrate de tener tus estilos

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
        // Guardar en localStorage
        localStorage.setItem("id_sesion", data.id_sesion);
        localStorage.setItem("nombre_usuario", data.nombre);
        localStorage.setItem("role", data.rol);

        // 1) Notificar a App que se actualice el estado de autenticación
        onLoginSuccess();

        // 2) Redirigir a la ruta protegida
        navigate("/menu_usuario");
      } else {
        setError(data.message || "Error: credenciales inválidas");
      }
    } catch (err) {
      setError("Error al conectar con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Sección izquierda con el logo y bienvenida */}
      <div className="login-left">
        <div className="welcome-message">
          <h1>Bienvenido al sistema de reconocimiento emocional</h1>
        </div>
        <img src="/LogoC.webp" alt="Logo" className="login-logo" />
        <p className="login-slogan">
          "Comprendiendo tus emociones con inteligencia artificial"
        </p>
      </div>

      {/* Sección derecha con el formulario */}
      <div className="login-right">
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
    </div>
  );
}

export default Login;