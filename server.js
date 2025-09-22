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
  try {
    const prompt = `A customer has requested a repair quote.\nName: ${Name}\nPhone: ${Phone}\nBrand: ${Brand}\nIssue: ${Issue}\nEmail: ${Email}\nDevice Type: ${DeviceType}\nDevice Model: ${DeviceModel}\nPlease provide a friendly, professional response and estimated next steps.`;
    const openaiRes = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    llmResponse = openaiRes.data.choices[0].message.content;
  } catch (err) {
    llmResponse = 'Sorry, there was an error generating your quote. Please try again later.';
  }
  res.send(`
    <html>
      <head>
        <title>Quote Received</title>
        <style>
          body { font-family: Arial, sans-serif; background: #f9f9f9; padding: 40px; }
          .container { max-width: 500px; margin: 0 auto; background: #fff; padding: 20px 30px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
          h2 { text-align: center; color: #333; }
          p { font-size: 16px; color: #555; }
          .llm-response { margin-top: 24px; padding: 16px; background: #e3f2fd; border-radius: 8px; color: #1565c0; font-size: 1.1rem; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Thank you, ${Name}!</h2>
          <p>Your quote request has been received.</p>
          <p><strong>Device:</strong> ${DeviceType} (${DeviceModel})</p>
          <p><strong>Brand:</strong> ${Brand}</p>
          <p><strong>Issue:</strong> ${Issue}</p>
          <p>We will contact you at <strong>${Email}</strong> or <strong>${Phone}</strong> soon.</p>
          <div class="llm-response">
            <strong>LLM Response:</strong><br>
            ${llmResponse}
          </div>
        </div>
      </body>
    </html>
  `);
});

// Fallback to index.html
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(port, () => console.log(`Server running on port ${port}`));
