const express = require("express");
const router = express.Router();
const { twiml: { MessagingResponse } } = require("twilio");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// POST /webhook/whatsapp (mounted at /webhook in server.js)
router.post("/whatsapp", async (req, res) => {
  console.log("📨 Webhook received:", req.body);
  try {
    const { Body } = req.body || {};
    const userMessage = (Body || "").trim();

    if (!userMessage) {
      const twiml = new MessagingResponse();
      twiml.message("Please send a message describing the situation so I can help.");
      res.set("Content-Type", "text/xml");
      return res.status(200).send(twiml.toString());
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error("❌ Missing OPENROUTER_API_KEY env var");
      const twiml = new MessagingResponse();
      twiml.message("⚠️ Service is temporarily unavailable. Please try again shortly.");
      res.set("Content-Type", "text/xml");
      return res.status(200).send(twiml.toString());
    }

    let aiText = "";
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a wildlife first responder assistant. Help users handle injured animals, wildlife conflicts, rescue requests, sightings, and general inquiries. Give clear, concise, empathetic guidance in WhatsApp-friendly language."
            },
            { role: "user", content: userMessage }
          ]
        })
      });

      const data = await response.json();
      aiText = (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content)
        ? String(data.choices[0].message.content).trim()
        : "";
    } catch (e) {
      console.error("❌ Error calling OpenRouter:", e);
    }

    if (!aiText) {
      aiText = "⚠️ Sorry, I'm having trouble responding right now. Please share your location, animal type, condition, urgency, and a contact number. If life-threatening, call your nearest rescue team immediately.";
    }

    const twiml = new MessagingResponse();
    twiml.message(aiText);
    res.set("Content-Type", "text/xml");
    return res.status(200).send(twiml.toString());

  } catch (err) {
    console.error("❌ Webhook error:", err);
    const twiml = new MessagingResponse();
    twiml.message("⚠️ An unexpected error occurred. Please try again.");
    res.set("Content-Type", "text/xml");
    return res.status(200).send(twiml.toString());
  }
});

module.exports = router;
