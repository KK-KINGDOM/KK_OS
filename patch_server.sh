#!/bin/bash
sed -i '/\/\/ Vite Integration & Server Listener/i \
// Pollinations AI Proxy for Real AI Responses\
app.post("/api/pollinations-chat", async (req, res) => {\
  try {\
    const { prompt } = req.body;\
    if (!prompt) {\
      return res.status(400).json({ error: "Prompt is required" });\
    }\
    const aiRes = await fetch(`https://text.pollinations.ai/prompt/${encodeURIComponent(prompt)}`);\
    const text = await aiRes.text();\
    res.json({ reply: text });\
  } catch (error) {\
    console.error("Pollinations proxy error:", error);\
    res.status(500).json({ error: "Failed to fetch from AI provider" });\
  }\
});\
' server.ts
