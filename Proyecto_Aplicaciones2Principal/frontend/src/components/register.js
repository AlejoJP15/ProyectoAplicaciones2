import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();


  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); // Limpiar errores previos

    
    setIsLoading(true); // Mostrar indicador de carga
    try {
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (data.success) {
        alert("Registro exitoso. Ahora puedes iniciar sesión.");
        navigate("/login"); // Redirige al login después de registrarse
      } else {
        setError(data.message || "Error al registrarse");
      }
    } catch (err) {
      setError("Error al conectarse al servidor");
    }finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Registrarse</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Registrarse</button>
      </form>
      <button onClick={() => navigate("/login")}>Volver al Login</button>
    </div>
  );
}

export default Register;
