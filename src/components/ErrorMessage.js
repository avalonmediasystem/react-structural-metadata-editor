import React from 'react';
import PropTypes from 'prop-types';
import { ErrorBoundary } from 'react-error-boundary';
import { Button } from 'react-bootstrap';

function Fallback({ resetErrorBoundary }) {
  return (
    <div role='alert' className='error-message-alert'>
      <span>
        An error was encountered. Please try again.
      </span>
      <Button
        variant='primary'
        onClick={resetErrorBoundary}>
        Try again
      </Button>
    </div>
  );
}

const ErrorMessage = ({ children }) => {
  return (
    <ErrorBoundary FallbackComponent={Fallback}>
      {children}
    </ErrorBoundary>
  );
};

ErrorMessage.propTypes = {
  message: PropTypes.string,
  children: PropTypes.object
};

export default ErrorMessage;
