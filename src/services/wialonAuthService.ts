/**
 * Wialon Authentication Service
 * Direct API calls to Wialon hosting API
 */

const WIALON_API_URL = "https://hst-api.wialon.com/wialon/ajax.html";

export interface WialonLoginResponse {
  eid?: string;
  sid?: string;
  au?: string;
  user?: {
    nm: string;
    id: number;
    cls: number;
  };
  error?: number;
  reason?: string;
}

/**
 * Login to Wialon using token
 * Matches the successful curl request pattern
 */
export async function wialonTokenLogin(token: string): Promise<WialonLoginResponse> {
  try {
    const formData = new URLSearchParams();
    formData.append('svc', 'token/login');
    formData.append('params', JSON.stringify({ token }));

    const response = await fetch(WIALON_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: WialonLoginResponse = await response.json();
    
    // Check for Wialon API errors
    if (data.error) {
      throw new Error(`Wialon API error ${data.error}: ${data.reason || 'Unknown error'}`);
    }

    return data;
  } catch (error) {
    console.error('Wialon login error:', error);
    throw error;
  }
}

/**
 * Logout from Wialon
 */
export async function wialonLogout(sid: string): Promise<void> {
  try {
    const formData = new URLSearchParams();
    formData.append('svc', 'core/logout');
    formData.append('sid', sid);

    const response = await fetch(WIALON_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Wialon logout error:', error);
    throw error;
  }
}
