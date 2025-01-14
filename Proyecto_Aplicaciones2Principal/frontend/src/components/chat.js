import React, { useState } from "react";

function Chat() {
  const [message, setMessage] = useState(""); // Mensaje actual del usuario
  const [conversation, setConversation] = useState([]); // Historial de la conversación
  const [error, setError] = useState(""); // Manejo de errores

  // Obtén el session_id desde localStorage
  const sessionId = localStorage.getItem("id_sesion");

  const sendMessage = async (e) => {
    e.preventDefault();
    setError(""); // Reinicia el estado del error

    if (!sessionId) {
      setError("No se encontró un session_id. Por favor, inicia sesión nuevamente.");
      return;
    }

    try {
      // Agrega el mensaje del usuario a la conversación
      setConversation((prev) => [...prev, { sender: "Usuario", text: message }]);

      // Envía el mensaje al backend
      const response = await fetch("http://localhost:5000/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: message, session_id: sessionId }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        // Agrega la respuesta del chatbot a la conversación
        setConversation((prev) => [...prev, { sender: "Chatbot", text: data.response }]);
      }
    } catch (err) {
      console.error("Error al enviar el mensaje:", err);
      setError("No se pudo enviar el mensaje. Inténtalo más tarde.");
    } finally {
      setMessage(""); // Limpia el mensaje después de enviarlo
    }
  };

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
      // Redirigir al usuario al login
      window.location.href = "/login";
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  };

  return (
    <div>
      <h2>Chatbot</h2>

      {/* Mostrar conversación */}
      <div className="conversation">
        {conversation.map((msg, index) => (
          <p
            key={index}
            className={msg.sender === "Usuario" ? "user-message" : "bot-message"}
          >
            <strong>{msg.sender}:</strong> {msg.text}
          </p>
        ))}
      </div>

      {/* Formulario para enviar mensajes */}
      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escribe tu mensaje..."
          required
        />
        <button type="submit">Enviar</button>
      </form>

      {/* Mostrar errores */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Botón para cerrar sesión */}
      <button onClick={handleLogout}>Cerrar Sesión</button>
    </div>
  );
}

export default Chat;
