(function () {
  const express = require('express');
  const admin = require('firebase-admin');

  /**
   * Simple Express server with Firebase Admin SDK integration.
   * Make sure to set GOOGLE_APPLICATION_CREDENTIALS env variable to your service account JSON.
   */

  const app = express();
  const PORT = process.env.PORT || 3000;

  // Initialize Firebase Admin SDK
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });

  // Example route: Get user info by UID
  app.get('/user/:uid', async (req, res) => {
    try {
      const userRecord = await admin.auth().getUser(req.params.uid);
      res.json(userRecord);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  });

  // Health check
  app.get('/health', (req, res) => {
    res.send('Server is healthy');
  });

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
})();
