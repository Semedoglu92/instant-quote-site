const express = require('express');
const path = require('path');
const axios = require('axios');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;



app.use(express.urlencoded({ extended: true }));
// Serve everything in the repo root
app.use(express.static(path.join(__dirname), {
  setHeaders: (res, filePath) => {
    if (/\.(js|css|png|jpg|jpeg|gif|svg|ico|webp|woff2?)$/.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// Handle form submission and call OpenAI
app.post('/quote', async (req, res) => {
  const { Name, Phone, Brand, Issue, Email, DeviceType, DeviceModel } = req.body;
  let llmResponse = '';
  let n8nResponse = null;
  const n8nUrl = process.env.N8N_URL;

  // If an n8n webhook URL is configured, try to call it first and use its calculation/result
  if (n8nUrl) {
    try {
      const n8nRes = await axios.post(n8nUrl, { Name, Phone, Brand, Issue, Email, DeviceType, DeviceModel }, { timeout: 8000 });
      // Accept JSON responses; normalize string content into message/quote fields
      if (n8nRes && n8nRes.data) {
        n8nResponse = n8nRes.data;
      }
    } catch (err) {
      console.error('n8n call failed:', err && err.message ? err.message : err);
      n8nResponse = null;
    }
  }
  if (n8nResponse) {
    // Prefer n8n's calculated response. Map common fields.
    const message = typeof n8nResponse.message === 'string' ? n8nResponse.message
      : (typeof n8nResponse.quote === 'string' ? n8nResponse.quote : JSON.stringify(n8nResponse));
    const turnaround = n8nResponse.turnaround || n8nResponse.eta || 'Typically 1-3 business days (depends on parts availability)';
    llmResponse = message;
    const response = { message: llmResponse, quote: llmResponse, turnaround };
    return res.json(response);
  }

  if (!process.env.OPENAI_API_KEY) {
    // Local dev fallback: return a friendly mock response so the frontend can display something
    const est = (Math.floor(Math.random() * 150) + 50); // mock estimate between $50-200
    llmResponse = `Hi ${Name || 'there'}, thanks for the details. For a ${Brand || DeviceModel || DeviceType} with the issue you've described ("${Issue || 'unspecified'}"), a typical screen replacement/repair starts around $${est}. Next steps: reply to this message or bring the device in so we can confirm diagnostics. Est. turnaround: 1-3 business days.`;
  } else {
    try {
      const prompt = `A customer has requested a repair quote.\nName: ${Name}\nPhone: ${Phone}\nBrand: ${Brand}\nIssue: ${Issue}\nEmail: ${Email}\nDevice Type: ${DeviceType}\nDevice Model: ${DeviceModel}\nPlease provide a friendly, professional response and estimated next steps, and include an estimated turnaround time.`;
      const openaiRes = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      llmResponse = openaiRes.data?.choices?.[0]?.message?.content || '';
    } catch (err) {
      console.error('LLM error:', err && err.message ? err.message : err);
      llmResponse = 'Sorry, there was an error generating your quote. Please try again later.';
    }
  }

  // Provide a JSON response the front-end can consume
  const response = {
    message: llmResponse,
    quote: llmResponse,
    turnaround: 'Typically 1-3 business days (depends on parts availability)'
  };

  res.json(response);
});

// Fallback to index.html
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(port, () => console.log(`Server running on port ${port}`));
