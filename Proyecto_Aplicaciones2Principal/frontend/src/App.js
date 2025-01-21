import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/login";
import Register from "./components/register";
import MenuUsuario from "./components/menu_usuario"; // Ruta del menú de usuario
import MenuAdmin from "./components/menu_admin"; // Ruta del menú de admin
import MisInteracciones from "./components/mis-interacciones"; // Ruta para Mis Interacciones
import GestionarUsuario from "./components/gestionar_usuario"; // Ruta para Gestionar Usuario

function App() {
  const isAuthenticated = !!localStorage.getItem("id_sesion"); // Comprueba si el usuario está autenticado
  const userRole = localStorage.getItem("role"); // Obtiene el rol del usuario

  return (
    <Router>
      <Routes>
        {/* Ruta principal: redirige al login si no está autenticado */}
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? (userRole === "admin" ? "/menu_admin" : "/menu_usuario") : "/login"} />}
        />

        {/* Rutas específicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Menú para usuario */}
        <Route
          path="/menu_usuario"
          element={isAuthenticated ? (userRole !== "admin" ? <MenuUsuario /> : <Navigate to="/menu_admin" />) : <Navigate to="/login" />}
        />

        {/* Menú para administrador */}
        <Route
          path="/menu_admin"
          element={isAuthenticated && userRole === "admin" ? <MenuAdmin /> : <Navigate to="/login" />}
        />

        {/* Ruta para Mis Interacciones */}
        <Route
          path="/mis-interacciones"
          element={isAuthenticated && userRole !== "admin" ? <MisInteracciones /> : <Navigate to="/login" />}
        />

        {/* Ruta para Gestionar Usuario */}
        <Route
          path="/gestionar_usuario"
          element={isAuthenticated && userRole !== "admin" ? <GestionarUsuario /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
