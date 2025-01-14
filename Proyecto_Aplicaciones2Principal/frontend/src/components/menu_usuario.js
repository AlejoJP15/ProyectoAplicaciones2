import React from "react";
import { useNavigate } from "react-router-dom";

function MenuUsuario() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Limpiar sesión
    localStorage.removeItem("id_sesion");
    localStorage.removeItem("nombre_usuario");
    localStorage.removeItem("role");
    navigate("/login");  // Redirige al login
  };
  const handleChatbotRedirect = () => {
    // Redirige al microservicio de chatbot (asegúrate de que esté corriendo en el puerto correcto)
    const sessionId = localStorage.getItem("id_sesion");
    const userName = localStorage.getItem("nombre_usuario");
    const rol = localStorage.getItem("role");
    if (sessionId && userName) {
      // Redirige al frontend del chatbot que está en otro puerto
      window.location.href = `http://localhost:3002?session_id=${sessionId}&nombre_usuario=${encodeURIComponent(userName)}&role=${encodeURIComponent(rol)}`;
    } else {
      alert("No se encuentra la sesión, por favor inicie sesión.");
    }
  };
  return (
    <div>
      <h1>Menú Usuario</h1>
      <ul>
        <li>
          <button onClick={() => navigate("/mis-interacciones")}>Revisar Mis Interacciones</button>
        </li>
        <li>
            <button onClick={handleChatbotRedirect}>Interactuar con Chatbot</button>
        </li>
        <li>
          <button onClick={() => navigate("/gestionar-cuenta")}>Gestionar Mi Cuenta</button>
        </li>
        <li>
          <button onClick={handleLogout}>Cerrar Sesión</button>
        </li>
      </ul>
    </div>
  );
}

export default MenuUsuario;