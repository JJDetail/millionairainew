// index.js
// Entry point for MillionairAI's backend

const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (_, res) => {
  res.send("MillionairAI backend is live. Use /api/chat to talk to MasterBot.");
});

app.listen(PORT, () => {
  console.log(`🌐 MillionairAI backend running at http://localhost:${PORT}`);
});
