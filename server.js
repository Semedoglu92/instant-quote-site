const express = require('express');
const path = require('path');
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

// Handle form submission
app.post('/quote', (req, res) => {
  const { Name, Phone, Brand, Issue, Email, DeviceType, DeviceModel } = req.body;
  res.send(`
    <html>
      <head>
        <title>Quote Received</title>
        <style>
          body { font-family: Arial, sans-serif; background: #f9f9f9; padding: 40px; }
          .container { max-width: 500px; margin: 0 auto; background: #fff; padding: 20px 30px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
          h2 { text-align: center; color: #333; }
          p { font-size: 16px; color: #555; }
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
        </div>
      </body>
    </html>
  `);
});

// Fallback to index.html
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(port, () => console.log(`Server running on port ${port}`));
