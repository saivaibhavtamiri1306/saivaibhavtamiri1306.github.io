// At the top of your app.js, after the other 'require' statements
const { GoogleGenerativeAI } = require('@google/generative-ai');

// IMPORTANT: In Netlify, you'll set an environment variable, for example, GEMINI_API_KEY.
// Then you access it here.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Your existing app.post('/api/chat', ...) route
app.post('/api/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Generate the response
    const result = await model.generateContent(userMessage);
    const response = await result.response;
    const text = response.text();

    // Send the AI's reply back to the front-end
    res.json({ reply: text });

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: 'Failed to get a response from the AI.' });
  }
});
