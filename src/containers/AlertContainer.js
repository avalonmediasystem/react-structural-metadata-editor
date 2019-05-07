import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'react-bootstrap';
import { isEmpty } from 'lodash';

class AlertContainer extends Component {
  static propTypes = {
    message: PropTypes.string,
    alertStyle: PropTypes.oneOf(['success', 'warning', 'danger', 'info']),
    clearAlert: PropTypes.func
  };

  state = {
    show: false
  };

  componentDidMount() {
    if (this.props.message) {
      this.setState({ show: true });
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (isEmpty(nextProps)) {
      return { show: false };
    }
    if (nextProps.message && !prevState.show) {
      return { show: true };
    }
    return null;
  }

  handleDismiss = () => {
    this.setState({ show: false });
    this.props.clearAlert();
  };

  render() {
    const { alertStyle, message } = this.props;

    if (!this.state.show) {
      return null;
    }

    return (
      <Alert bsStyle={alertStyle} onDismiss={this.handleDismiss}>
        <p>{message}</p>
      </Alert>
    );
  }
}

export default AlertContainer;
