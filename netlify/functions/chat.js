exports.handler = async (event) => {
  try {
    const { messages, system } = JSON.parse(event.body);
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.REACT_APP_ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system,
        messages,
        tools: [
          {
            type: "web_search_20250305",
            name: "web_search",
          }
        ],
      }),
    });
    const data = await res.json();
    console.log("Anthropic response:", JSON.stringify(data));
    
    const textBlock = data.content?.find(block => block.type === "text");
    const reply = textBlock?.text || "Yo something went wrong on my end. Try again.";
    
    return { statusCode: 200, body: JSON.stringify({ content: [{ type: "text", text: reply }] }) };
  } catch (err) {
    console.log("Error:", err.message);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};