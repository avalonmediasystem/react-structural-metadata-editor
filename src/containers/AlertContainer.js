import React from 'react';
import { useSelector } from 'react-redux';
import Alert from 'react-bootstrap/Alert';

function AlertContainer({ removeAlert }) {
  let alertList = [];
  let alertMessage = [];

  // State variables from global redux store
  const { alerts } = useSelector((state) => state.forms);

  if (alerts && alerts.length != 0) {
    alerts.map((alert) => {
      const { alertStyle, message, persistent, id } = alert;
      if (!alertMessage.includes(message)) {
        alertMessage.push(message);
        if (!persistent) {
          alertList.push(
            <Alert
              key={id}
              variant={alertStyle}
              data-testid='alert-container'
              onClose={() => { removeAlert(id); }}
              dismissible >
              <p data-testid="alert-message">{message}</p>
            </Alert>
          );
        } else {
          alertList.push(
            <Alert
              key={id}
              variant={alertStyle}
              data-testid='persistent-alert-container' >
              <p data-testid="alert-message">{message}</p>
            </Alert>
          );
        }
      }
    });
  }

  if (alerts) {
    return <div>{alertList}</div>;
  } else {
    return null;
  }
}

export default AlertContainer;
