import React from "react";
import { useNavigate } from "react-router-dom";

function MenuAdmin() {
  const navigate = useNavigate();
  const sessionId = localStorage.getItem("id_sesion");
 
  const handleLogout = async () => {
    try {
      // Enviar solicitud de logout al backend
      await fetch("http://localhost:5000/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_sesion: sessionId }),
      });
      // Limpiar el session_id del localStorage
      localStorage.removeItem("id_sesion");
      localStorage.removeItem("nombre_usuario");
      localStorage.removeItem("role");
      // Redirigir al usuario al login
      window.location.href = "/login";
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  };

  const handleUserManagement = () => {
    navigate("/gestionar-usuarios");  // Redirige a la sección de gestión de usuarios
  };

  const handleViewStatistics = () => {
    navigate("/ver-estadisticas");  // Redirige a la sección de estadísticas
  };

  const handleAppSettings = () => {
    navigate("/configuracion-app");  // Redirige a la sección de configuración de la app
  };

  return (
    <div>
      <h1>Menú Administrador</h1>
      <ul>
        <li>
          <button onClick={handleUserManagement}>Gestionar Usuarios</button>
        </li>
        <li>
          <button onClick={handleViewStatistics}>Ver Estadísticas</button>
        </li>
        <li>
          <button onClick={handleAppSettings}>Configuración de la Aplicación</button>
        </li>
        <li>
          <button onClick={handleLogout}>Cerrar Sesión</button>
        </li>
      </ul>
    </div>
  );
}

export default MenuAdmin;
