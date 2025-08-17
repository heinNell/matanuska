/**
 * Wialon Diagnostics Page
 *
 * This page provides tools for diagnosing and troubleshooting
 * Wialon API integration issues.
 */
import React from 'react';
import { Helmet } from 'react-helmet';
import WialonDiagnosticTool from '../components/diagnostic/WialonDiagnosticTool';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const WialonDiagnosticsPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Wialon Diagnostics | Matanuska</title>
      </Helmet>

      <div className="container py-10">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Wialon Integration Diagnostics</h1>
            <p className="text-muted-foreground mt-2">
              Troubleshoot and fix common Wialon API connection issues
            </p>
          </div>

          <Tabs defaultValue="diagnostics" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
              <TabsTrigger value="troubleshooting">Troubleshooting Guide</TabsTrigger>
              <TabsTrigger value="configuration">Configuration</TabsTrigger>
            </TabsList>

            <TabsContent value="diagnostics" className="space-y-6">
              <WialonDiagnosticTool />
            </TabsContent>

            <TabsContent value="troubleshooting" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Wialon Integration Troubleshooting Guide</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium">Common Error Codes</h3>
                      <div className="mt-2 space-y-4">
                        <div>
                          <h4 className="font-medium">Error Code 4: Invalid Session</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Your session has expired or the token is invalid. You need to log in again
                            to obtain a new session token.
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium">Error Code 1: Invalid User Credentials</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            The username or password provided is incorrect. Double-check your credentials
                            and try again.
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium">Error Code 7: Access Denied</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Your user account doesn't have permission to perform this action. Contact your
                            Wialon administrator to request the necessary permissions.
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium">Error Code 8: Invalid Service</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            The requested service name doesn't exist or is misspelled. Verify the service
                            name in your API calls.
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium">Error Code 2: Rate Limit Exceeded</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Too many requests have been made in a short time. Implement rate limiting in
                            your application and try again after a short delay.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium">Network Issues</h3>
                      <ul className="list-disc pl-5 space-y-2 mt-2 text-sm text-gray-600">
                        <li>
                          <strong>CORS errors:</strong> If seeing CORS errors, ensure you're using the
                          correct API endpoint for your environment. Browser-based applications must use
                          the CORS-enabled endpoints.
                        </li>
                        <li>
                          <strong>Connection timeouts:</strong> Network latency or firewall issues may
                          be blocking connections to Wialon servers. Try increasing timeouts or checking
                          firewall settings.
                        </li>
                        <li>
                          <strong>DNS resolution problems:</strong> If the Wialon domain can't be
                          resolved, check your DNS settings or try using IP addresses directly.
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium">Authentication Issues</h3>
                      <ul className="list-disc pl-5 space-y-2 mt-2 text-sm text-gray-600">
                        <li>
                          <strong>Token format:</strong> Ensure your token is correctly formatted and
                          hasn't been corrupted by whitespace or encoding issues.
                        </li>
                        <li>
                          <strong>Token expiration:</strong> Wialon tokens have expiration times.
                          Implement token refresh logic to obtain new tokens when needed.
                        </li>
                        <li>
                          <strong>IP restrictions:</strong> Your Wialon account may have IP restrictions.
                          Verify that your server's IP is whitelisted in the Wialon admin panel.
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="configuration" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Wialon Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium">Environment Variables</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Make sure the following environment variables are properly set:
                      </p>
                      <ul className="list-disc pl-5 space-y-2 mt-2 text-sm text-gray-600">
                        <li>
                          <code className="bg-gray-100 px-1 py-0.5 rounded">VITE_WIALON_API_URL</code>:
                          The base URL for Wialon API requests (default: https://hst-api.wialon.com)
                        </li>
                        <li>
                          <code className="bg-gray-100 px-1 py-0.5 rounded">VITE_WIALON_SDK_URL</code>:
                          The URL to load the Wialon JavaScript SDK
                        </li>
                        <li>
                          <code className="bg-gray-100 px-1 py-0.5 rounded">VITE_WIALON_TOKEN</code>:
                          Your Wialon API token (for automated login)
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium">Configuration Files</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Check these configuration files if environment variables aren't working:
                      </p>
                      <ul className="list-disc pl-5 space-y-2 mt-2 text-sm text-gray-600">
                        <li>
                          <code className="bg-gray-100 px-1 py-0.5 rounded">/workspaces/matanuska/src/utils/wialonConfig2.ts</code>:
                          Main configuration file for Wialon settings
                        </li>
                        <li>
                          <code className="bg-gray-100 px-1 py-0.5 rounded">/workspaces/matanuska/.env.local</code>:
                          Local environment variables (not committed to git)
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default WialonDiagnosticsPage;
