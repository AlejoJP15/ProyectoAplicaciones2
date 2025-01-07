import fetch from "node-fetch";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.post("/generateText", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "El prompt es requerido" });
  }
  
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Eres un asistente que ayuda a resolver cualquier duda." },
          { role: "user", content: prompt },
        ],
        max_tokens: 50,
      }),
    });
    
    const data = await response.json();
    const chatbotResponse = data.choices[0]?.message?.content || "No se pudo generar una respuesta.";
    res.json({ response: chatbotResponse });
  } catch (error) {
    console.error("Error en el microservicio:", error);
    res.status(500).json({ error: "Error al procesar el mensaje" });
  }
});


const port = 3001;
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
