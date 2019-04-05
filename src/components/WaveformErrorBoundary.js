import React, { Component } from 'react';
import { Alert } from 'react-bootstrap';

class WaveformErrorBoundary extends Component {
  state = { error: '' };

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.error) {
      return (
        <Alert bsStyle="danger">
          <p>Error rendering Peak.js waveform</p>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default WaveformErrorBoundary;
