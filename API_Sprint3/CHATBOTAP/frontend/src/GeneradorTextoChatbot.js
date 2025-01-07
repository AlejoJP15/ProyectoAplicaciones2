import React, { use, useState } from "react";
import "./GeneradorTextoChatbot.css";
function GeneradorTextoChatbot(){
  const[prompt,setPrompt]= useState("");
  const[conversation, setConversation]= useState([]);
  const[isloading, setIsLoading]= useState(false);
  const[errorMessage, setErrorMessage]= useState("");
  const generateText = async (e)=>{
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
  
    try{

      const response = await fetch("http://localhost:3001/generateText",{
        method:  "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({prompt}),
      });
      
      if(!response.ok){
        throw new Error(`HTTP error`)
      }
      const data = await response.json();
      const respuestaChatGPT = data.response; 
      setConversation(prev =>[
        ...prev,
        {sender: "User", text: prompt},
        {sender: "EmoBOT", text:respuestaChatGPT}
      ])

    }catch(error){
      console.error("error")
      setErrorMessage("Error en la solicitud")
    }finally{
      setIsLoading(false);
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
        <button type="submit" disabled={isloading}>
          {isloading ? "Enviando..." : "Enviar"}
        </button>
      </form>
    </div>
  );
  


}
export default GeneradorTextoChatbot;

 

