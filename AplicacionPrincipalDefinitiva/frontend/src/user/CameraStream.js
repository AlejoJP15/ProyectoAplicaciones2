import React, { useState, useEffect } from "react";
import { FaUser, FaRobot, FaHome, FaSignOutAlt, FaCamera, FaPowerOff, FaSmile, FaFrown, FaMeh, FaAngry, FaSurprise } from "react-icons/fa";

function GeneradorTextoChatbot() {
  const [prompt, setPrompt] = useState("");
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [emocionDetectada, setEmocionDetectada] = useState("No detectado aún");
  const [camaraActiva, setCamaraActiva] = useState(false);
  const [timestamp, setTimestamp] = useState(Date.now());

  // Obtener session_id y nombre_usuario desde query params o localStorage
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const session_id = queryParams.get("session_id") || localStorage.getItem("id_sesion");
    const nombre = queryParams.get("nombre_usuario") || localStorage.getItem("nombre_usuario");

    if (session_id) {
      setSessionId(session_id);
    } else {
      setErrorMessage("No se encontró una sesión activa.");
      window.location.href = "http://localhost:3000/login";
    }
    if (nombre) {
      setNombreUsuario(nombre);
    }
  }, []);

  // Llamamos cada cierto tiempo a /detectar_emocion mientras la cámara esté activa
  useEffect(() => {
    let interval;
    if (camaraActiva) {
      interval = setInterval(() => {
        fetch("http://localhost:5000/detectar_emocion", {
          method: "POST",
        })
          .then((res) => res.json())

          .then((data) => setEmocionDetectada(data.emocion_predominante))
          .catch((err) => console.error("Error al detectar emoción:", err));
      }, 3000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [camaraActiva]);

  // Inicia la cámara (stream)
  const iniciarCamara = () => {
    setCamaraActiva(true);
    setTimestamp(Date.now());
  };

  // Detiene la cámara y guarda emoción en la BD (opcionalmente)
  const detenerCamara = async () => {
    try {
      await fetch("http://localhost:5000/stop_stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_sesion: sessionId }),
      });
      setCamaraActiva(false);
    } catch (error) {
      console.error("Error al detener la cámara:", error);
    }
  };

  // Guardar emoción manualmente (si tienes un endpoint separado para ello)
  const guardarEmocion = async () => {
    try {
      await fetch("http://localhost:5000/guardar_emocion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_sesion: sessionId, emocion: emocionDetectada }),
      });
      alert("Emoción guardada correctamente.");
    } catch (error) {
      console.error("Error al guardar emoción:", error);
    }
  };

  // Enviar prompt al Chatbot
  const generateText = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          id_sesion: sessionId,
          nombre_usuario: nombreUsuario,
          emocion_detectada: emocionDetectada,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(errorData.error || "Error desconocido en el servidor");
        return;
      }

      const data = await response.json();
      const respuestaChatGPT = data.response;

      setConversation((prev) => [
        ...prev,
        { sender: nombreUsuario, text: prompt, isUser: true, emocion: emocionDetectada },
        { sender: "Chatbot", text: respuestaChatGPT, isUser: false },
      ]);
    } catch (error) {
      setErrorMessage("Error en la solicitud al servidor");
    } finally {
      setIsLoading(false);
      setPrompt("");
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("id_sesion");
    localStorage.removeItem("nombre_usuario");
    window.location.href = "http://localhost:3000/login";
  };

  // Volver al menú principal
  const handleMenu = () => {
    window.location.href = "http://localhost:3000/menu_usuario";
  };

  // Función para mostrar ícono de emoción
  const getEmotionIcon = (emocion) => {
    const icons = {
      feliz: <FaSmile style={{ color: "yellow" }} />,
      triste: <FaFrown style={{ color: "blue" }} />,
      neutro: <FaMeh style={{ color: "gray" }} />,
      enojado: <FaAngry style={{ color: "red" }} />,
      sorprendido: <FaSurprise style={{ color: "orange" }} />,
    };
    return icons[emocion] || <FaMeh style={{ color: "gray" }} />;
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <button onClick={handleMenu} className="navbar-item">
          <FaHome className="navbar-icon" /> Menú Principal
        </button>
        <button onClick={handleLogout} className="navbar-item">
          <FaSignOutAlt className="navbar-icon" /> Cerrar Sesión
        </button>
      </nav>

      <div className="content-container">
        <div className="chatbot-container">
          {errorMessage && (
            <div className="error-message">
              <p>{errorMessage}</p>
            </div>
          )}

          {nombreUsuario && (
            <p className="chatbot-welcome">
              ¡Bienvenid@ <strong>{nombreUsuario}</strong>! ¿En qué puedo ayudarte hoy?
            </p>
          )}

          {/* Muestra la cámara si está activa */}
          <div className="camera-container">
            {camaraActiva ? (
              <img
                src={`http://localhost:5000/stream?t=${timestamp}`}
                alt="Stream de Video"
                className="camera-feed"
              />
            ) : (
              <p className="chatbot-emotion">Cámara apagada</p>
            )}
          </div>

          {/* Botón para iniciar/detener la cámara */}
          {!camaraActiva ? (
            <button className="custom-button" onClick={iniciarCamara}>
              <FaCamera /> Detectar una Emoción
            </button>
          ) : (
            <button className="custom-button" onClick={detenerCamara}>
              <FaPowerOff /> Apagar Cámara
            </button>
          )}

          {/* Botón extra para guardar la emoción manualmente (opcional) */}
          <button className="custom-button" onClick={guardarEmocion}>
            Guardar Emoción
          </button>

          {/* Emoción detectada */}
          <div className="emotion-bubble">
            {getEmotionIcon(emocionDetectada)} {emocionDetectada}
          </div>

          {/* Conversación con el chatbot */}
          <div className="chat-box">
            {conversation.map((msg, index) => (
              <div
                key={index}
                className={`message-container ${msg.isUser ? "user-message" : "bot-message"}`}
              >
                <div className="message-icon">
                  {msg.isUser ? <FaUser /> : <FaRobot />}
                </div>
                <div className="message-text">{msg.text}</div>
              </div>
            ))}
          </div>

          {/* Formulario para enviar prompt al chatbot */}
          <form onSubmit={generateText} className="chat-form">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Escribe un mensaje..."
              required
            />
            <button type="submit" className="custom-button" disabled={isLoading}>
              {isLoading ? "Enviando..." : "Enviar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default GeneradorTextoChatbot;