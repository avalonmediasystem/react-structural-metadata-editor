import React, { Component, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Alert } from 'react-bootstrap';
import { isEmpty } from 'lodash';
import { removeAlert } from '../actions/forms';

function AlertContainer(props) {
  // const [show, setShow] = React.useState(false);
  // const [alertList, setAlertList] = React.useState([]);

  let alertList = [];
  // useEffect(() => {
  if (props.alerts.length != 0) {
    // setShow(true);
    props.alerts.map((alert) => {
      const { alertStyle, message, persistent, id } = alert;
      const alertProps = {
        bsStyle: alertStyle,
        'data-testid': `${persistent ? 'persistent-' : ''}alert-container`,
        onDismiss: function () {
          persistent ? null : props.removeAlert(id);
        },
        key: id,
        dismissible: persistent ? 'false' : 'true',
        className: `${persistent ? 'alert' : 'alert-dismissible'}`,
      };
      console.log('Show and alert: ', alertProps);
      alertList.push(
        <Alert {...alertProps}>
          <p data-testid="alert-message">{message}</p>
        </Alert>
      );
    });
  }

  if (props.alerts) {
    console.log(alertList);
    return <React.Fragment>{alertList}</React.Fragment>;
  } else {
    return null;
  }
}

const mapDispatchToProps = {
  removeAlert: removeAlert,
};

export default connect(null, mapDispatchToProps)(AlertContainer);
