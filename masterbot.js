// Server-to-server only. Never expose MASTERBOT_ACCESS_TOKEN to browser code.
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '8kb' }));

const PORT = Number(process.env.PORT) || 3001;
const OPENAI_KEY = process.env.OPENAI_API_KEY || process.env.GPT_API_KEY;
const ACCESS_TOKEN = process.env.MASTERBOT_ACCESS_TOKEN;
const WINDOW_MS = 60_000;
const MAX_PER_MINUTE = 10;
const MAX_GLOBAL_PER_MINUTE = 120;
const hits = new Map();
let globalWindow = 0;
let globalCount = 0;

function authenticated(req, res, next) {
  if (!ACCESS_TOKEN || !OPENAI_KEY) {
    return res.status(503).json({ error: 'Service not configured' });
  }
  const header = req.get('authorization') || '';
  const prefix = 'Bearer ';
  if (!header.startsWith(prefix)) return res.status(401).json({ error: 'Unauthorized' });
  const candidate = Buffer.from(header.slice(prefix.length));
  const expected = Buffer.from(ACCESS_TOKEN);
  if (!candidate.length || candidate.length !== expected.length ||
      !crypto.timingSafeEqual(candidate, expected)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

function limited(req, res, next) {
  const now = Date.now();
  // Keep memory bounded even if many unique clients connect.
  if (hits.size > 5000) {
    for (const [key, state] of hits) {
      if (now - state.start >= WINDOW_MS) hits.delete(key);
    }
    if (hits.size > 5000) return res.status(429).json({ error: 'Server busy' });
  }
  if (now - globalWindow >= WINDOW_MS) { globalWindow = now; globalCount = 0; }
  if (++globalCount > MAX_GLOBAL_PER_MINUTE) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }
  const key = req.ip;
  let state = hits.get(key);
  if (!state || now - state.start >= WINDOW_MS) state = { start: now, count: 0 };
  state.count++;
  hits.set(key, state);
  if (state.count > MAX_PER_MINUTE) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }
  next();
}

app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

app.post('/api/chat', authenticated, limited, async (req, res) => {
  const message = req.body && req.body.message;
  if (typeof message !== 'string' || message.trim().length < 1 || message.length > 2000) {
    return res.status(400).json({ error: 'message must be 1-2000 characters' });
  }
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      max_tokens: 300,
      messages: [
        { role: 'system', content: 'You are MasterBot, a helpful assistant for MillionairAI.' },
        { role: 'user', content: message }
      ]
    }, {
      timeout: 15000,
      headers: { Authorization: `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' }
    });
    res.json({ reply: response.data?.choices?.[0]?.message?.content || '' });
  } catch (_error) {
    // Do not log upstream response bodies or keys.
    console.error('Chat request failed');
    res.status(502).json({ error: 'AI service temporarily unavailable' });
  }
});

// Avoid leaking parser errors or request bodies.
app.use((err, _req, res, _next) => {
  res.status(err.status || 400).json({ error: 'Invalid request' });
});

app.listen(PORT, () => console.log(`MasterBot listening on port ${PORT}`));
