/**
 * Client-side Wialon session management
 * Use this in React components to create server-side sessions
 */

interface ServerSessionResponse {
  sid?: string;
  error?: string;
}

/**
 * Request a new Wialon session from your server
 * This calls your backend API to create a session server-side
 */
export async function requestWialonSession(): Promise<ServerSessionResponse> {
  try {
    const response = await fetch('/api/wialon/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Session request error:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to request session'
    };
  }
}

/**
 * React hook for managing server-side Wialon sessions
 */
import { useState, useEffect } from 'react';

interface UseServerSessionReturn {
  sessionId: string | null;
  loading: boolean;
  error: string | null;
  refreshSession: () => Promise<void>;
}

export function useServerWialonSession(): UseServerSessionReturn {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshSession = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await requestWialonSession();

      if (result.error) {
        setError(result.error);
        setSessionId(null);
      } else {
        setSessionId(result.sid || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get session');
      setSessionId(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  return {
    sessionId,
    loading,
    error,
    refreshSession,
  };
}
