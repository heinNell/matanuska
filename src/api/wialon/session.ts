// Wialon Session API Service
// This can be used as a server-side utility or converted to an API endpoint

interface WialonLoginResponse {
  eid?: string;
  sid?: string;
  error?: number;
  reason?: string;
  [key: string]: any;
}

interface SessionResult {
  sid?: string;
  error?: string;
}

/**
 * Create Wialon session using environment token
 * This function can be used server-side or adapted for API routes
 */
export async function createWialonSession(): Promise<SessionResult> {
  // Check if token is available
  if (!process.env.WIALON_TOKEN) {
    return { error: 'Wialon token not configured in environment' };
  }

  try {
    // Use dynamic import for node-fetch to handle both environments
    const fetch = (await import('node-fetch')).default;

    const resp = await fetch('https://hst-api.wialon.com/wialon/ajax.html', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        svc: 'token/login',
        params: JSON.stringify({ token: process.env.WIALON_TOKEN }),
      }),
    });

    if (!resp.ok) {
      throw new Error(`HTTP error! status: ${resp.status}`);
    }

    const data = await resp.json() as WialonLoginResponse;

    // Check for Wialon API errors
    if (data.error) {
      return {
        error: `Wialon API error ${data.error}: ${data.reason || 'Unknown error'}`
      };
    }

    // Return session ID (use eid which is typically the session ID in Wialon responses)
    const sessionId = data.eid || data.sid;
    if (!sessionId) {
      return { error: 'No session ID returned from Wialon' };
    }

    return { sid: sessionId };
  } catch (error) {
    console.error('Wialon session error:', error);
    return {
      error: error instanceof Error ? error.message : 'Internal server error'
    };
  }
}

// Express.js style handler if you're using Express
export function createExpressHandler() {
  return async (req: any, res: any) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const result = await createWialonSession();

    if (result.error) {
      return res.status(400).json(result);
    }

    res.json(result);
  };
}

// Default export for compatibility
export default createWialonSession;
