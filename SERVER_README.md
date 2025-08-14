# Express Server Implementation

This project includes two server implementations:

## Basic Express Server (index.js)

The original server implementation that serves the Vite-built frontend and provides basic API endpoints.

```bash
# Run the basic server
npm start

# Development mode with nodemon for auto-reloading
npm run backend
```

## Enhanced Express Server (server.js)

An enhanced version with additional features:

- CORS support
- Response compression
- JSON body parsing
- Extended error handling
- Additional API endpoints
- Improved logging

```bash
# Run the enhanced server
npm run serve
```

## API Endpoints

Both servers provide the following endpoints:

- `GET /health` - Health check endpoint
- `GET /api/hello` - Example API endpoint

The enhanced server also includes:

- `GET /api/version` - Returns app version and environment info

## Development

To run both the frontend and backend in development mode:

```bash
npm run dev
```

This will start the Vite development server for the frontend and the Express server using nodemon.

## Production

For production, build the frontend first, then start the server:

```bash
npm run build
npm start  # Use the basic server
# or
npm run serve  # Use the enhanced server
```

The server will serve the static files from the `dist` directory and handle all API requests.
