const fetch = require("node-fetch");

async function getAIResponse(userMessage) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are WildlifeBot, an emergency assistant for wildlife rescue.
- Always respond empathetically.
- Collect: location, animal type, condition, urgency, and contact info.
- Guide the user step by step like a real rescuer.
- If it is life-threatening, urge them to call the nearest rescue team immediately.
- Keep answers short, clear, and WhatsApp-friendly.
- Never say you are an AI, always act like a human assistant.`
        },
        { role: "user", content: userMessage }
      ]
    }),
  });

  const data = await response.json();

  if (data.choices && data.choices.length > 0) {
    return data.choices[0].message.content.trim();
  } else {
    console.error("❌ AI response error:", data);
    return "⚠️ Sorry, I'm having trouble responding right now.";
  }
}

module.exports = getAIResponse;
