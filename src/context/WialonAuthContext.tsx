import React, { createContext, useContext, useState, useEffect } from "react";
import { wialonTokenLogin, wialonLogout, type WialonLoginResponse } from "../services/wialonAuthService";

interface WialonAuthContextType {
  isLoggedIn: boolean;
  loginData: WialonLoginResponse | null;
  isLoading: boolean;
  error: string | null;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const WialonAuthContext = createContext<WialonAuthContextType | undefined>(undefined);

export function useWialonAuth(): WialonAuthContextType {
  const context = useContext(WialonAuthContext);
  if (!context) {
    throw new Error('useWialonAuth must be used within a WialonAuthProvider');
  }
  return context;
}

interface WialonAuthProviderProps {
  children: React.ReactNode;
}

export function WialonAuthProvider({ children }: WialonAuthProviderProps) {
  const [loginData, setLoginData] = useState<WialonLoginResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session in localStorage on mount
  useEffect(() => {
    const savedLoginData = localStorage.getItem('wialonLoginData');
    if (savedLoginData) {
      try {
        const parsedData = JSON.parse(savedLoginData);
        setLoginData(parsedData);
      } catch (err) {
        console.error('Failed to parse saved login data:', err);
        localStorage.removeItem('wialonLoginData');
      }
    }
  }, []);

  const login = async (token: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await wialonTokenLogin(token);
      setLoginData(response);
      
      // Save to localStorage for persistence
      localStorage.setItem('wialonLoginData', JSON.stringify(response));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (loginData?.sid) {
        await wialonLogout(loginData.sid);
      }
    } catch (err) {
      console.error('Logout error:', err);
      // Continue with local logout even if server logout fails
    } finally {
      setLoginData(null);
      localStorage.removeItem('wialonLoginData');
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: WialonAuthContextType = {
    isLoggedIn: !!loginData?.user,
    loginData,
    isLoading,
    error,
    login,
    logout,
    clearError,
  };

  return (
    <WialonAuthContext.Provider value={value}>
      {children}
    </WialonAuthContext.Provider>
  );
}
