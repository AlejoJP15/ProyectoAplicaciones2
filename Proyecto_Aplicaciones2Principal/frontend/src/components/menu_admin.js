import React from "react";
import { useNavigate } from "react-router-dom";

function MenuAdmin() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Limpiar sesión
    localStorage.removeItem("id_sesion");
    localStorage.removeItem("nombre_usuario");
    localStorage.removeItem("role");
    navigate("/login");  // Redirige al login
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
