import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Alert } from 'react-bootstrap';
import { isEmpty } from 'lodash';

class AlertContainer extends Component {
  static propTypes = {
    message: PropTypes.string,
    alertStyle: PropTypes.oneOf(['success', 'warning', 'danger', 'info']),
    dismiss: PropTypes.bool,
    clearAlert: PropTypes.func,
  };

  state = {
    show: false,
  };
  // Timer to hide save feedback alert
  hideAlertTimer = null;

  static getDerivedStateFromProps(nextProps, prevState) {
    if (isEmpty(nextProps)) {
      return { show: false };
    }
    if (nextProps.message && !prevState.show) {
      return { show: true };
    }
    return null;
  }

  componentDidUpdate() {
    const { delay, editingDisabled, type } = this.props;
    const self = this;
    // For successfull save flash messages
    if (type === 'SAVE_FEEDBACK') {
      // remove flash message after the given delay time in milliseconds
      if (delay > 0 && !this.hideAlertTimer) {
        self.hideAlertTimer = setTimeout(function () {
          self.state.show ? self.handleDismiss() : null;
        }, delay);
      }
      /** remove flash message when editing the structure
       *  within 2000ms after saving previous changes */
      if (editingDisabled) {
        self.handleDismiss();
      }
    }
  }

  handleDismiss = () => {
    this.props.clearAlert();
    this.setState({ show: false });
    if (this.hideAlertTimer) {
      clearTimeout(this.hideAlertTimer);
      this.hideAlertTimer = null;
    }
  };

  render() {
    const { alertStyle, message, persistent } = this.props;

    if (!this.state.show) {
      return null;
    }

    const alertProps = {
      bsStyle: alertStyle,
      'data-testid': `${persistent ? 'persistent-' : ''}alert-container`,
      onDismiss: persistent ? null : this.handleDismiss,
    };

    // return persistent ? (
    return (
      <Alert {...alertProps}>
        <p data-testid="alert-message">{message}</p>
      </Alert>
    );
    // ) : (
    //   <Alert
    //     bsStyle={alertStyle}
    //     onDismiss={this.handleDismiss}
    //     data-testid="alert-container"
    //   >
    //     <p data-testid="alert-message">{message}</p>
    //   </Alert>
    // );
  }
}
const mapStateToProps = (state) => ({
  editingDisabled: state.forms.editingDisabled,
});

export default connect(mapStateToProps)(AlertContainer);
