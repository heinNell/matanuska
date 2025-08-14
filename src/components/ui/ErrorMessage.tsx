import React from 'react';
import { AlertCircle, XCircle, AlertTriangle, Info, RefreshCw, X } from 'lucide-react';

// Import from our error handling utils if available
type ErrorSeverity = 'fatal' | 'error' | 'warning' | 'info';

interface ErrorMessageProps {
  title?: string;
  message: string;
  details?: string | null;
  severity?: ErrorSeverity;
  timestamp?: Date | null;
  onRetry?: () => void;
  onClose?: () => void;
  className?: string;
  showDetails?: boolean;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title,
  message,
  details = null,
  severity = 'error',
  timestamp = null,
  onRetry,
  onClose,
  className = '',
  showDetails = false
}) => {
  // Get styles based on severity
  const getSeverityStyles = () => {
    switch (severity) {
      case 'fatal':
        return {
          containerClass: 'bg-red-100 border-red-600 text-red-900',
          iconColor: 'text-red-600',
          icon: <XCircle className="h-5 w-5" />
        };
      case 'error':
        return {
          containerClass: 'bg-red-50 border-red-400 text-red-800',
          iconColor: 'text-red-500',
          icon: <AlertCircle className="h-5 w-5" />
        };
      case 'warning':
        return {
          containerClass: 'bg-yellow-50 border-yellow-400 text-yellow-800',
          iconColor: 'text-yellow-500',
          icon: <AlertTriangle className="h-5 w-5" />
        };
      case 'info':
        return {
          containerClass: 'bg-blue-50 border-blue-400 text-blue-800',
          iconColor: 'text-blue-500',
          icon: <Info className="h-5 w-5" />
        };
      default:
        return {
          containerClass: 'bg-red-50 border-red-400 text-red-800',
          iconColor: 'text-red-500',
          icon: <AlertCircle className="h-5 w-5" />
        };
    }
  };

  const styles = getSeverityStyles();
  
  // Format timestamp if provided
  const formattedTime = timestamp 
    ? new Intl.DateTimeFormat('default', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(timestamp)
    : null;

  return (
    <div 
      className={`rounded-md border px-4 py-3 ${styles.containerClass} ${className}`}
      role="alert"
    >
      <div className="flex items-start">
        <div className={`mr-3 flex-shrink-0 ${styles.iconColor}`}>
          {styles.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">
              {title || (severity === 'fatal' 
                ? 'Critical Error' 
                : severity === 'error' 
                  ? 'Error' 
                  : severity === 'warning' 
                    ? 'Warning' 
                    : 'Information')}
            </h3>
            {onClose && (
              <button 
                onClick={onClose}
                className="ml-2 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <span className="sr-only">Dismiss</span>
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <div className="mt-1">
            <p className="text-sm">{message}</p>
            
            {details && showDetails && (
              <div className="mt-2">
                <details className="text-xs">
                  <summary className="cursor-pointer text-xs font-medium hover:underline">
                    Show technical details
                  </summary>
                  <pre className="mt-1 overflow-auto whitespace-pre-wrap rounded bg-gray-800 p-2 text-left font-mono text-xs text-white">
                    {details}
                  </pre>
                </details>
              </div>
            )}
            
            {formattedTime && (
              <p className="mt-1 text-xs opacity-75">
                Occurred at {formattedTime}
              </p>
            )}
          </div>
          
          {onRetry && (
            <div className="mt-3">
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center rounded-md border border-transparent bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <RefreshCw className="mr-1.5 h-3 w-3" />
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
