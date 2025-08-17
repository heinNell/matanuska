/**
 * Wialon Diagnostic Component
 *
 * Provides an interface for running Wialon API diagnostics
 * and displaying results with troubleshooting recommendations.
 */
import React, { useState } from 'react';
import { runWialonDiagnostics, DiagnosticResult } from '../utils/wialonDiagnostics';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { AlertCircle, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';

export const WialonDiagnosticTool: React.FC = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDiagnostics = async () => {
    setLoading(true);
    setError(null);

    try {
      const diagnosticResults = await runWialonDiagnostics();
      setResults(diagnosticResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run diagnostics');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: 'success' | 'warning' | 'error') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusClass = (status: 'success' | 'warning' | 'error') => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-amber-50 border-amber-200';
      case 'error':
        return 'bg-red-50 border-red-200';
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Wialon API Diagnostics</CardTitle>
        <CardDescription>
          Troubleshoot connection issues with the Wialon API
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}

        {results.length > 0 ? (
          <div className="space-y-3">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 border rounded-md ${getStatusClass(result.status)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getStatusIcon(result.status)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{result.message}</h3>
                    {result.details && (
                      <p className="text-sm mt-1 text-gray-600">{result.details}</p>
                    )}

                    {result.recommendations && result.recommendations.length > 0 && (
                      <div className="mt-2">
                        <h4 className="text-sm font-medium mb-1">Recommendations:</h4>
                        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                          {result.recommendations.map((rec, recIndex) => (
                            <li key={recIndex}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Click 'Run Diagnostics' to check Wialon API connectivity
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          onClick={runDiagnostics}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Running Diagnostics...
            </>
          ) : (
            'Run Diagnostics'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WialonDiagnosticTool;
