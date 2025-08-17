// server-cloudrun.js
(function() {
  const express = require('express');
  const app = express();
  const PORT = process.env.PORT || 8080;

  app.get('/health', (req, res) => res.send('Cloud Run server is healthy'));
  app.get('/', (req, res) => res.send('Hello from Cloud Run!'));

  app.listen(PORT, () => {
    console.log(`Cloud Run server listening on port ${PORT}`);
  });
})();
