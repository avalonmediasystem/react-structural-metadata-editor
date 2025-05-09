import React, { useEffect, useState } from 'react';
import Alert from 'react-bootstrap/Alert';

const ErrorBoundary = ({ children, fallback }) => {
  const { error, handleError } = useErrorHandler();

  useEffect(() => {
    try {

    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  if (error) {
    return fallback || (<Alert variant="danger" data-testid="alert-container">
      <p data-testid="alert-message">Something went wrong...</p>
    </Alert>);
  }
  return children;
};

export default ErrorBoundary;

// Custom hook to enable error boundary behavior without a class component
function useErrorHandler() {
  const [error, setError] = useState(null);

  const handleError = (err) => {
    setError(err);
  };

  return { error, handleError };
}
