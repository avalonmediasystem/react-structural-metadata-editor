import React, { Component } from 'react';
import { Alert } from 'react-bootstrap';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.log('Error: ', error);
  }

  render() {
    if (this.state.error) {
      return (
        <Alert bsStyle="danger" data-testid="alert-container">
          <p data-testid="alert-message">Something went wrong...</p>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
