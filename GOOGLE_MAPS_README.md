# Google Maps Integration

This project includes Google Maps integration using the `@vis.gl/react-google-maps` library and `@googlemaps/markerclusterer`.

## Setup

1. Copy the `.env.local.example` file to `.env.local`:

   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your Google Maps API key:

   ```
   GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   # Use the standard Vite configuration:
   npm start

   # OR use the local configuration (uses .env.local):
   npm run start-local
   ```

## Available Scripts

- `npm start` - Starts the Vite development server
- `npm run start-local` - Starts Vite with local environment configuration
- `npm run build` - Builds the project for production

## Libraries Used

- [@vis.gl/react-google-maps](https://github.com/visgl/react-google-maps) - React components for Google Maps
- [@googlemaps/markerclusterer](https://github.com/googlemaps/js-markerclusterer) - Groups markers that are close together
