import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // Estado para manejar errores
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const isEmailValid = (email) => {
    const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
    return emailRegex.test(email);
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Limpiar errores previos
    setIsLoading(true);
    console.log("Login iniciado");
    const dispositivo = navigator.userAgent; // Información del dispositivo
    const canal = "web"; // Canal fijo como ejemplo
    console.log("Enviando datos:", { email, password, dispositivo, canal });
    

    // Validaciones del frontend
    if (!email || !password) {
      setError("Por favor completa todos los campos");
      setIsLoading(false);
      return;
    }
    if (!email.includes('@')) {
      setError("El correo debe contener '@'");
      setIsLoading(false);
      return;
    }
    if (!isEmailValid(email)) {
      setError("Por favor ingresa un correo válido");
      setIsLoading(false);
      return;
    }


    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, dispositivo, canal }),
      });
      const data = await response.json();

       if (!response.ok) {
        // Mostrar el mensaje de error del backend
        setError(data.message || "Error desconocido al iniciar sesión");
        setIsLoading(false);
        return;
      }

      
      if (data.success) {
        // Guarda la sesión del usuario
        localStorage.setItem("id_sesion", data.id_sesion);
        localStorage.setItem("nombre_usuario", data.nombre);
        localStorage.setItem("role", data.rol);

        if (data.rol === "admin") {
          // Redirige al menú del administrador
          window.location.href = `http://localhost:3000/menu_admin?session_id=${data.id_sesion}&nombre_usuario=${encodeURIComponent(data.nombre)}&role=${encodeURIComponent(data.rol)}`;
        } else {
          // Redirige al menú del usuario
          window.location.href = `http://localhost:3000/menu_usuario?session_id=${data.id_sesion}&nombre_usuario=${encodeURIComponent(data.nombre)}&role=${encodeURIComponent(data.rol)}`;
        }
      }
    } catch (err) {
      setError("Error al conectar con el servidor");
    }finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Iniciar Sesión</h2>
      {/* Mostrar mensajes de error */}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Correo"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
         
        />
        <input
          type="password"
          placeholder="Contraseña"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          
        />
        <button type="submit">Iniciar Sesión</button>
      </form>
      <button onClick={() => navigate("/register")}>Registrarse</button>
    </div>
  );
}

export default Login;
