import React from 'react';
import { connect } from 'react-redux';
import { Alert } from 'react-bootstrap';

function AlertContainer(props) {
  let alertList = [];
  if (props.alerts && props.alerts.length != 0) {
    props.alerts.map((alert) => {
      const { alertStyle, message, persistent, id } = alert;
      const alertProps = {
        variant: alertStyle,
        'data-testid': `${persistent ? 'persistent-' : ''}alert-container`,
        key: id,
        dismissible: persistent ? 'false' : 'true',
        className: persistent ? '' : 'alert-dismissable',
      };
      if (!persistent) {
        alertProps.onClose = function () {
          props.removeAlert(id);
        };
      }
      alertList.push(
        <Alert {...alertProps}>
          <p data-testid="alert-message">{message}</p>
        </Alert>
      );
    });
  }

  if (props.alerts) {
    return <div>{alertList}</div>;
  } else {
    return null;
  }
}

const mapStateToProps = (state) => ({
  alerts: state.forms.alerts,
});
export default connect(mapStateToProps)(AlertContainer);
