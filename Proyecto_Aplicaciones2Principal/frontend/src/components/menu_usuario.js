import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/menu_usuario.css"; // Importa el archivo CSS personalizado

function MenuUsuario() {
  const navigate = useNavigate();
  const sessionId = localStorage.getItem("id_sesion");

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_sesion: sessionId }),
      });
      localStorage.removeItem("id_sesion");
      localStorage.removeItem("nombre_usuario");
      localStorage.removeItem("role");
      window.location.href = "/login";
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  };

  const handleChatbotRedirect = () => {
    const sessionId = localStorage.getItem("id_sesion");
    const userName = localStorage.getItem("nombre_usuario");
    const rol = localStorage.getItem("role");
    if (sessionId && userName) {
      window.location.href = `http://localhost:3002?session_id=${sessionId}&nombre_usuario=${encodeURIComponent(
        userName
      )}&role=${encodeURIComponent(rol)}`;
    } else {
      alert("No se encuentra la sesión, por favor inicie sesión.");
    }
  };

  return (
    <div className="menu-container flex flex-col items-center justify-center min-h-screen">
      <h1 className="menu-title mb-8">
      Menú de Usuario
      </h1>
      <div className="menu-box bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <ul className="space-y-4">
          <li className="menu-item">
            <button
              onClick={() => navigate("/mis-interacciones")}
              className="menu-button"
            >
              <span className="icon">&#128214;</span> {/* Icono de libro */}
              Revisar Mis Interacciones
            </button>
          </li>
          <li className="menu-item">
            <button onClick={handleChatbotRedirect} className="menu-button">
              <span className="icon">&#129302;</span> {/* Icono de chatbot */}
              Interactuar con Chatbot
            </button>
          </li>
          <li className="menu-item">
            <button
              onClick={() => navigate("/gestionar_usuario")}
              className="menu-button"
            >
              <span className="icon">&#128100;</span> {/* Icono de usuario */}
              Gestionar Mi Cuenta
            </button>
          </li>
          <li className="menu-item">
            <button onClick={handleLogout} className="menu-button logout">
              <span className="icon">&#128682;</span> {/* Icono de cerrar sesión */}
              Cerrar Sesión
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default MenuUsuario;
