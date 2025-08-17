/**
 * Hook for accessing Wialon diagnostic features
 * 
 * This hook provides an interface to the Wialon diagnostic tools
 * for running connectivity tests and troubleshooting Wialon integration issues.
 */
import { useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { WialonContext } from '../context/WialonProvider';

export const useWialonDiagnostics = () => {
  const { runDiagnostics, diagnosticResults, isDiagnosticRunning } = useContext(WialonContext);
  const navigate = useNavigate();
  
  /**
   * Run Wialon diagnostics and optionally navigate to diagnostics page
   */
  const diagnoseWialon = useCallback(async (options: { 
    redirect?: boolean; // Whether to navigate to diagnostics page after running tests
    silent?: boolean;   // Whether to run in background without UI feedback
  } = {}) => {
    const { redirect = true, silent = false } = options;
    
    try {
      const results = await runDiagnostics();
      
      // Navigate to diagnostics page if requested
      if (redirect) {
        navigate('/admin-management/wialon-diagnostics');
      }
      
      return results;
    } catch (error) {
      if (!silent) {
        console.error('Wialon diagnostic error:', error);
      }
      throw error;
    }
  }, [runDiagnostics, navigate]);
  
  /**
   * Open the diagnostics page without running tests
   */
  const openDiagnostics = useCallback(() => {
    navigate('/admin-management/wialon-diagnostics');
  }, [navigate]);

  return {
    diagnoseWialon,
    openDiagnostics,
    diagnosticResults,
    isDiagnosticRunning
  };
};

export default useWialonDiagnostics;
