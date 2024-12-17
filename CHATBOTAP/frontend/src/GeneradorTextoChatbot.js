import React, { useState, useEffect } from "react";
import "./GeneradorTextoChatbot.css";

function GeneradorTextoChatbot() {
  const [prompt, setPrompt] = useState("");
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [graphUrl, setGraphUrl] = useState(""); // Estado para la URL de la gráfica

  // Obtener la URL de la gráfica al cargar el componente
  useEffect(() => {
    setGraphUrl("http://localhost:5000/api/graph"); // URL de la imagen generada
  }, []);

  const generateText = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error`);
      }

      const data = await response.json();
      const respuestaChatGPT = data.response;

      // Actualizar la conversación
      setConversation((prev) => [
        ...prev,
        { sender: "User", text: prompt },
        { sender: "ChatGPT", text: respuestaChatGPT },
      ]);
    } catch (error) {
      console.error("Error en la solicitud:", error);
      setErrorMessage("Error en la solicitud");
    } finally {
      setIsLoading(false);
      setPrompt("");
    }
  };

  return (
    <div className="chat-container">
      {/* Mostrar errores si los hay */}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {/* Mostrar conversación */}
      <div className="chat-box">
        {conversation.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.sender === "User" ? "user" : "bot"}`}
          >
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
      </div>

      {/* Input para el mensaje */}
      <form onSubmit={generateText} className="input-form">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Escribe tu mensaje..."
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Enviando..." : "Enviar"}
        </button>
      </form>

      {/* Mostrar la gráfica */}
      {graphUrl && (
        <div className="graph-container">
          <h2>Estadísticas de Interacciones</h2>
          <img src={graphUrl} alt="Gráfica de interacciones" />
        </div>
      )}
    </div>
  );
}

export default GeneradorTextoChatbot;
