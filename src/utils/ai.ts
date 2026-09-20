export async function generateAIResponse(prompt: string): Promise<string> {
  try {
    if (!prompt.trim()) return "Please provide a question or topic!";

    const res = await fetch("/api/pollinations-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });
    
    const data = await res.json();
    
    if (data.reply) {
      return data.reply;
    }
    
    return "I couldn't process that right now. Please try again.";
  } catch (err) {
    console.error("AI Error:", err);
    return "I'm having trouble connecting to my AI brain. Please check your network and try again.";
  }
}
