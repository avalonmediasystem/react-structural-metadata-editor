import React, { Component, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Alert } from 'react-bootstrap';
import { isEmpty } from 'lodash';
import { removeAlert } from '../actions/forms';

function AlertContainer(props) {
  let alertList = [];
  if (props.alerts && props.alerts.length != 0) {
    props.alerts.map((alert) => {
      const { alertStyle, message, persistent, id } = alert;
      const alertProps = {
        bsStyle: alertStyle,
        'data-testid': `${persistent ? 'persistent-' : ''}alert-container`,
        key: id,
        dismissible: persistent ? 'false' : 'true',
        className: persistent ? '' : 'alert-dismissable',
      };
      if (!persistent) {
        alertProps.onDismiss = function () {
          props.removeAlert(id);
        };
      }
      console.log('Show and alert: ', alertProps);
      alertList.push(
        <Alert {...alertProps}>
          <p data-testid="alert-message">{message}</p>
        </Alert>
      );
    });
  }

  if (props.alerts) {
    return <React.Fragment>{alertList}</React.Fragment>;
  } else {
    return null;
  }
}

export default AlertContainer;
