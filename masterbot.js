// masterbot.js
// MillionairAI GPT-powered chatbot

require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;
const OPENAI_KEY = process.env.GPT_API_KEY;

// GPT-4 Chat Endpoint
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) return res.status(400).send({ error: 'Missing user message' });

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are MasterBot, a helpful and witty assistant for MillionairAI.com.' },
          { role: 'user', content: message }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const reply = response.data.choices[0].message.content;
    res.send({ reply });

  } catch (error) {
    console.error('GPT API error:', error.response?.data || error.message);
    res.status(500).send({ error: 'Failed to get response from MasterBot.' });
  }
});

app.listen(PORT, () => console.log(`🤖 MasterBot running on port ${PORT}`));
