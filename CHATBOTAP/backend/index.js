import fetch from "node-fetch";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.post("/generateText", async (req, res) => {
  const prompt = req.body.prompt;
  const token = process.env.API_KEY;

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };

  const data = {
    model: "gpt-3.5-turbo",
    max_tokens: 20,
    messages: [
      { role: "system", content: "Eres un asistente que ayuda a resolver cualquier duda." },
      { role: "user", content: prompt },
    ],
  };

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text(); // Obtener respuesta de error del servidor
      throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    console.log("Respuesta de OpenAI:", responseData);

    // Corregido: Acceder a la respuesta correcta de OpenAI
    const respuestaChatGPT = responseData.choices[0].message.content;

    res.json({ response: respuestaChatGPT });
  } catch (error) {
    console.error("Hubo un error:", error.message);
    res.status(500).json({ error: "Hubo un error al conectar con OpenAI", details: error.message });
  }
});

const port = 3001;
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
