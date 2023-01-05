import * as alertStatus from '../alert-status';

describe('alert-status service', () => {
  it('returns a default configuration object', () => {
    const alertObj = alertStatus.configureAlert();
    expect(alertObj).toHaveProperty('alertStyle');
    expect(alertObj).toHaveProperty('message');
  });

  it('returns the correct status code alert configurations', () => {
    expect(alertStatus.configureAlert(401)).toHaveProperty(
      'message',
      alertStatus.UNAUTHORIZED_ACCESS
    );
    expect(alertStatus.configureAlert(404)).toHaveProperty(
      'message',
      alertStatus.FETCH_MANIFEST_ERROR
    );
    expect(alertStatus.configureAlert(250)).toHaveProperty(
      'message',
      alertStatus.SAVE_STRUCTURE_SUCCESS
    );
    expect(alertStatus.configureAlert(-1)).toHaveProperty(
      'message',
      alertStatus.NETWORK_ERROR
    );
  });
});
