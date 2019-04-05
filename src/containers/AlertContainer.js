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

  componentDidUpdate(prevProps, prevState) {
    if (this.props.message && !prevState.show) {
      this.setState({ show: true });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (isEmpty(nextProps)) {
      this.setState({ show: false });
    }
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
