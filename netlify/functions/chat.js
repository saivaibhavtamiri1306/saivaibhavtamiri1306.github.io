exports.handler = async function(event) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ Missing GEMINI_API_KEY environment variable");
      return { statusCode: 500, body: "Server misconfiguration: no API key" };
    }

    const body = event.body ? JSON.parse(event.body) : {};
    const model = body.model || 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify(body.payload || body),
    });

    const data = await response.json();
    return {
      statusCode: response.ok ? 200 : response.status,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
