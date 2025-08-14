/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

export const api = onRequest((request, response) => {
  logger.info("Received request", {
    method: request.method,
    path: request.path,
    query: request.query,
    structuredData: true
  });

  try {
    switch (request.method) {
      case 'GET':
        response.json({
          status: 'success',
          message: 'API is running',
          timestamp: new Date().toISOString()
        });
        break;

      case 'POST':
        const data = request.body;
        logger.info("Received POST data", { data });
        response.json({
          status: 'success',
          message: 'Data received',
          data
        });
        break;

      default:
        response.status(405).json({
          status: 'error',
          message: `Method ${request.method} not allowed`
        });
    }
  } catch (error) {
    logger.error("Error processing request", error);
    response.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});
