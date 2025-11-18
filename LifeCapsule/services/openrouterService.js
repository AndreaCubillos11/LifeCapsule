import axios from "axios";
import { OPENROUTER_API_KEY } from "@env"; // Clave del archivo .env

// Endpoint de la API de OpenRouter
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function getAISuggestions() {

  try {
    const prompt = `
    Eres un asistente creativo que genera ideas de cápsulas del tiempo digitales.
    Devuelve 3 sugerencias breves (una o dos líneas) inspiradoras o nostálgicas 
    que motiven al usuario a crear una nueva cápsula. 
    Ejemplo de tono: "Hoy podrías escribir sobre algo que te hizo sonreír esta semana 😊"
    Devuélvelo en formato JSON con el campo "suggestions": ["...", "...", "..."]
    `;

    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: "nvidia/nemotron-nano-12b-v2-vl:free",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "X-Title": "LifeCapsule",  // nombre visible en OpenRouter
          "Content-Type": "application/json",
        },
      }
    );

    // Extraemos el mensaje
    const message = response.data?.choices?.[0]?.message?.content;

    if (!message) {
      console.error("⚠️ Respuesta vacía o inválida:", response.data);
      return [];
    }

    try {
      // Buscamos el primer bloque JSON dentro del texto
      const jsonMatch = message.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.suggestions || [];
      } else {
        // Si no se encuentra JSON, tomamos las líneas normales
        return message
          .split("\n")
          .map(line => line.trim())
          .filter(line => line !== "");
      }
    } catch (err) {
      console.error("⚠️ Error al parsear JSON:", err.message);
      return message
        .split("\n")
        .map(line => line.trim())
        .filter(line => line !== "");
    }

  } catch (error) {
    if (error.response) {
      console.error(
        `❌ Error al obtener sugerencias de IA: ${error.response.status}`,
        JSON.stringify(error.response.data)
      );
    } else {
      console.error("❌ Error de conexión con la API:", error.message);
    }
    return [];
  }
}
