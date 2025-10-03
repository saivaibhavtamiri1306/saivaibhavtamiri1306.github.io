// netlify/functions/chat.js
const fetch = require('node-fetch');

exports.handler = async function(event) {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    // Expect the front-end to forward the full request payload (or fullPrompt)
    // Example: { fullPrompt: "...", model: "gemini-2.5-flash" }
    const model = body.model || 'gemini-2.5-flash-preview-05-20'; // pick your model
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY
      },
      body: JSON.stringify(body.payload || body)
    });

    const data = await response.json();
    return {
      statusCode: response.ok ? 200 : response.status,
      body: JSON.stringify(data)
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
