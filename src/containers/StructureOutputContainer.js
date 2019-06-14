import React, { Component } from 'react';
import { connect } from 'react-redux';
import List from '../components/List';
import { Button, Col, Row } from 'react-bootstrap';
import APIUtils from '../api/Utils';
import AlertContainer from './AlertContainer';
import { configureAlert } from '../services/alert-status';

class StructureOutputContainer extends Component {
  constructor(props) {
    super(props);
    this.apiUtils = new APIUtils();
  }
  state = {
    alertObj: this.props.alertObj,
    baseURL: this.props.baseURL,
    masterFileID: this.props.masterFileID,
    structureStatus: this.props.forms.structureStatus
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.structureStatus !== nextProps.forms.structureStatus) {
      return {
        alertObj: configureAlert(
          nextProps.forms.structureStatus,
          nextProps.clearAlert
        )
      };
    }
    if (nextProps.alertObj === null) {
      return { alertObj: null };
    }
    return null;
  }

  clearAlert = () => {
    this.setState({
      alertObj: null
    });
  };

  handleSaveError(error) {
    console.log('TCL: handleSaveError -> error', error);
    let status =
      error.response !== undefined
        ? error.response.status
        : error.request.status;
    const alertObj = configureAlert(status, this.clearAlert);

    this.setState({ alertObj });
  }

  handleSaveItClick = async () => {
    const { baseURL, masterFileID } = this.state;
    let postData = { json: this.props.smData[0] };
    try {
      const response = await this.apiUtils.postRequest(
        baseURL,
        masterFileID,
        'structure.json',
        postData
      );
      const { status } = response;
      const alertObj = configureAlert(status, this.clearAlert);
      this.setState({ alertObj });
    } catch (error) {
      this.handleSaveError(error);
    }
  };

  render() {
    const { forms, smData } = this.props;
    const { alertObj } = this.state;

    return (
      <section
        className="structure-section"
        data-testid="structure-output-section"
      >
        {!forms.structureRetrieved ? (
          <AlertContainer {...alertObj} />
        ) : (
          <div data-testid="structure-output-list">
            <AlertContainer {...alertObj} />
            <List items={smData} />
            <Row>
              <Col xs={12} className="text-right">
                <Button
                  bsStyle="primary"
                  onClick={this.handleSaveItClick}
                  data-testid="structure-save-button"
                >
                  Save Structure
                </Button>
              </Col>
            </Row>
          </div>
        )}
      </section>
    );
  }
}

const mapStateToProps = state => ({
  smData: state.smData,
  forms: state.forms
});

export default connect(mapStateToProps)(StructureOutputContainer);
