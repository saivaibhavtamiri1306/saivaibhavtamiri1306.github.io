// Located at: /netlify/functions/chat.js

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Get your API key from Netlify environment variables
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

exports.handler = async function (event, context) {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { fullPrompt } = JSON.parse(event.body);

    if (!fullPrompt) {
      return { statusCode: 400, body: "Bad Request: fullPrompt is missing." };
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: text }),
    };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error: Failed to get response from AI." }),
    };
  }
};
