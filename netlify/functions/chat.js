// Import the Google AI SDK
const { GoogleGenerativeAI } = require('@google/generative-ai');

// IMPORTANT: Make sure you have set GEMINI_API_KEY in your Netlify Environment Variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// This is the main handler function for the Netlify serverless function
exports.handler = async (event) => {
  
  // Standard headers for CORS (Cross-Origin Resource Sharing) to allow your frontend to call this function
  const headers = {
    'Access-Control-Allow-Origin': '*', // Allows any domain to access this function
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // The browser first sends an OPTIONS request to check CORS policy
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204, // No Content
      headers,
      body: ''
    };
  }
  
  // We only want to handle POST requests
  if (event.httpMethod !== 'POST') {
    return { 
        statusCode: 405, 
        headers,
        body: JSON.stringify({ error: 'Method Not Allowed. Please use POST.' }) 
    };
  }

  try {
    // 1. Parse the incoming request body from the frontend
    // Your App.js sends a body like: JSON.stringify({ fullPrompt: fullPrompt })
    const { fullPrompt } = JSON.parse(event.body);

    // 2. Check if the prompt exists
    if (!fullPrompt) {
      return { 
          statusCode: 400, 
          headers,
          body: JSON.stringify({ error: 'Request body must contain a "fullPrompt" key.' }) 
      };
    }

    // 3. Call the Gemini API to get the chat completion
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    // 4. Send the successful response back to the frontend
    // Your App.js expects a JSON object with a "text" key: const aiText = result.text
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ text: text }),
    };
    
  } catch (error) {
    // If anything goes wrong, log the error and send a server error response
    console.error('Error in Netlify function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'An internal server error occurred.' }),
    };
  }
};
