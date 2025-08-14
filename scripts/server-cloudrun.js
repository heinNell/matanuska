const express = require('express');

const app = express();
const PORT = process.env.PORT || 8080;

// Health check endpoint for Cloud Run
app.get('/health', (req, res) => {
    res.send('Cloud Run server is healthy');
});

// Example endpoint
app.get('/', (req, res) => {
    res.send('Hello from Cloud Run!');
});

app.listen(PORT, () => {
    console.log(`Cloud Run server listening on port ${PORT}`);
});
