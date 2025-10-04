/* eslint-disable no-unused-vars */
const fetch = require('node-fetch');

/**
 * Netlify serverless function to handle chat requests to the Gemini API.
 * This function acts as a secure proxy to avoid exposing the API key on the client-side.
 */
exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
      headers: { 'Content-Type': 'application/json' },
    };
  }

  // --- Get API Key from Environment Variables ---
  // Ensure you have REACT_APP_GEMINI_API_KEY set in your Netlify build environment.
  const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API key is not configured.' }),
      headers: { 'Content-Type': 'application/json' },
    };
  }

  // --- Parse Request Body ---
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
      body: JSON.stringify({ error: 'Bad Request: Missing or invalid "fullPrompt" in the request body.' }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
  
  // --- Call Gemini API ---
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
    },
    // Optional Safety Settings: Adjust as needed
    safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    ],
  };

  try {
    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    // Handle non-successful responses from the API
    if (!apiResponse.ok) {
        const errorBody = await apiResponse.
