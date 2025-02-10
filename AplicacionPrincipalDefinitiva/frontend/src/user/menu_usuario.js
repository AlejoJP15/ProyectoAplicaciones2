import React from "react";
import { useNavigate } from "react-router-dom";
import {FaComments, FaUser, FaSignOutAlt, FaRobot } from "react-icons/fa";
import "../styles/menu_usuario.css";

function MenuUsuario() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_sesion: localStorage.getItem("id_sesion") }),
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
    <div>
      {/* Menú Superior */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand" onClick={() => navigate("/")}>
             Mi Proyecto AI
          </div>
          <ul className="navbar-menu">
            <li className="navbar-item" onClick={() => navigate("/mis-interacciones")}>
             <FaComments /> Mis Interacciones
            </li>
            <li className="navbar-item" onClick={() => navigate("/camera-stream")}>
             <FaRobot /> Chatbot
            </li>
            <li className="navbar-item" onClick={() => navigate("/user/ActualizaUser")}>
             <FaUser /> Mi Cuenta
            </li>
            <li className="navbar-item logout" onClick={handleLogout}>
             <FaSignOutAlt /> Cerrar Sesión
            </li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="animate-fade-in">¡Explora el Futuro de la Tecnología Emocional!</h1>
          <p className="animate-slide-up">
            Sumérgete en el mundo del reconocimiento facial, de voz y lenguaje natural. Una experiencia de vanguardia diseñada para ti.
          </p>
          <button className="cta-btn animate-pulse" onClick={() => navigate("/explorar")}>Descubre Más</button>
        </div>
        <div className="hero-image animate-zoom-in">
          <img
            src="https://via.placeholder.com/600x400"
            alt="Tecnología Emocional"
          />
        </div>
      </section>

      {/* Características Destacadas */}
      <section className="features-section">
        <h2 className="animate-fade-in">Características Destacadas</h2>
        <div className="features-container">
          <div className="feature-item animate-slide-up">
            <h3>Reconocimiento Facial</h3>
            <p>Identifica emociones y patrones con la máxima precisión.</p>
          </div>
          <div className="feature-item animate-slide-up">
            <h3>Procesamiento de Lenguaje Natural</h3>
            <p>Interpreta el significado detrás de cada palabra.</p>
          </div>
          <div className="feature-item animate-slide-up">
            <h3>Interfaz Intuitiva</h3>
            <p>Diseñada para garantizar la mejor experiencia de usuario.</p>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="testimonials-section">
        <h2 className="animate-fade-in">Lo Que Dicen Nuestros Usuarios</h2>
        <div className="testimonials-container">
          <div className="testimonial-item animate-slide-up">
            <p>
              "Esta plataforma transformó la manera en que interactúo con la tecnología. ¡Es increíble!"
            </p>
            <h4>- Santiago Velez</h4>
          </div>
          <div className="testimonial-item animate-slide-up">
            <p>
              "El reconocimiento facial y de voz es sorprendentemente preciso. Lo recomiendo 100%."
            </p>
            <h4>- Kevin Tapia</h4>
          </div>
          <div className="testimonial-item animate-slide-up">
            <p>
              "Una experiencia única y fácil de usar. Definitivamente supera las expectativas."
            </p>
            <h4>- Carlos García</h4>
          </div>
        </div>
      </section>

      {/* Pie de Página */}
      <footer className="footer">
        <div className="footer-content animate-fade-in">
          <p>&copy; 2025 Mi Proyecto AI. Todos los derechos reservados.</p>
          <ul className="footer-links">
            <li onClick={() => navigate("/politica-privacidad")}>Política de Privacidad</li>
            <li onClick={() => navigate("/terminos-condiciones")}>Términos y Condiciones</li>
            <li onClick={() => navigate("/contacto")}>Contacto</li>
          </ul>
        </div>
      </footer>
    </div>
  );
}

export default MenuUsuario;






