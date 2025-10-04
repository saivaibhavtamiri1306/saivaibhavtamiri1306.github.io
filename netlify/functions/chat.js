/* eslint-disable no-unused-vars */
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
      headers: { 'Content-Type': 'application/json' },
    };
  }

  const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    console.error("FATAL: GEMINI_API_KEY environment variable not set.");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API key is not configured on the server.' }),
      headers: { 'Content-Type': 'application/json' },
    };
  }

  let fullPrompt;
  try {
    const body = JSON.parse(event.body);
    fullPrompt = body.fullPrompt;
    if (!fullPrompt || typeof fullPrompt !== 'string') {
      throw new Error('Invalid prompt provided.');
    }
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Bad Request: Missing or invalid "fullPrompt".' }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
  
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;

  const payload = {
    contents: [{
      parts: [{ text: fullPrompt }],
    }],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    }
  };

  try {
    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    if (!apiResponse.ok) {
        const errorBody = await apiResponse.json();
        console.error('Gemini API Error:', errorBody);
        return {
            statusCode: apiResponse.status,
            body: JSON.stringify({ error: `Gemini API Error: ${errorBody.error?.message || 'Unknown error'}` }),
            headers: { 'Content-Type': 'application/json' },
        };
    }

    const result = await apiResponse.json();
    const aiText = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) {
       console.warn('AI response was empty or blocked.');
       return {
         statusCode: 200,
         body: JSON.stringify({ text: "I'm sorry, I could not generate a response for that." }),
         headers: { 'Content-Type': 'application/json' },
       };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ text: aiText }),
      headers: { 'Content-Type': 'application/json' },
    };

  } catch (error) {
    console.error('Internal Server Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An internal server error occurred.' }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
};
