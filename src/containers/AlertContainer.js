import React from 'react';
import { connect } from 'react-redux';
import Alert from 'react-bootstrap/Alert';

function AlertContainer(props) {
  let alertList = [];
  let alertMessage = [];
  if (props.alerts && props.alerts.length != 0) {
    props.alerts.map((alert) => {
      const { alertStyle, message, persistent, id } = alert;
      if (!alertMessage.includes(message)) {
        alertMessage.push(message);
        if (!persistent) {
          alertList.push(
            <Alert
              key={id}
              variant={alertStyle}
              data-testid='alert-container'
              onClose={() => { props.removeAlert(id); }}
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
