// File: netlify/functions/chat.js
export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const { fullPrompt } = JSON.parse(event.body);
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    if (!apiKey) { throw new Error('API key is not set on the server.'); }
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }] }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI response failed with status: ${response.status}. Body: ${errorText}`);
    }
    const result = await response.json();
    const aiText = result.candidates?.[0]?.content?.parts?.[0]?.text || "I'm having trouble connecting to the AI.";
    return {
      statusCode: 200,
      body: JSON.stringify({ text: aiText.replace(/\*/g, '') }),
    };
  } catch (err) {
    console.error('Function Error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};