import React, { Component } from 'react';
import { connect } from 'react-redux';
import List from '../components/List';
import { Button, Col, Row } from 'react-bootstrap';
import APIUtils from '../api/Utils';
import AlertContainer from './AlertContainer';
import { configureAlert } from '../services/alert-status';
import uuidv1 from 'uuid/v1';
import { cloneDeep } from 'lodash';
import { buildSMUI } from '../actions/sm-data';
import { handleStructureMasterFile } from '../actions/forms';

class StructureOutputContainer extends Component {
  constructor(props) {
    super(props);
    this.apiUtils = new APIUtils();
  }
  state = {
    fetchAlertObj: {},
    postAlertObj: {}
  };

  async componentDidMount() {
    try {
      const response = await this.apiUtils.getRequest('structure.json');

      // Add unique ids to every object
      let smData = this.addIds([response.data]);

      // Tag the root element
      this.markRootElement(smData);

      // Update the redux store
      this.props.buildSMUI(smData);

      // Update redux-store flag for structure file retrieval
      this.props.handleStructureFile(0);
    } catch (error) {
      console.log('TCL: StructureOutputContainer -> }catch -> error', error);
      this.handleFetchError(error);
    }
  }

  /**
   * This function adds a unique, front-end only id, to every object in the data structure
   * @param {Array} structureJS
   * @returns {Array}
   */
  addIds(structureJS) {
    let structureWithIds = cloneDeep(structureJS);

    // Recursively loop through data structure
    let fn = items => {
      for (let item of items) {
        // Create and add an id
        item.id = uuidv1();

        // Send child items back into the function
        if (item.items && item.items.length > 0) {
          fn(item.items);
        }
      }
    };

    fn(structureWithIds);

    return structureWithIds;
  }

  markRootElement(smData) {
    if (smData.length > 0) {
      smData[0].type = 'root';
    }
  }

  clearFetchAlert = () => {
    this.setState({
      fetchAlertObj: null
    });
  };

  clearPostAlert = () => {
    this.setState({
      postAlertObj: null
    });
  };

  handleFetchError(error) {
    let status = error.response !== undefined ? error.response.status : -2;
    const fetchAlertObj = configureAlert(status, this.clearFetchAlert);

    this.setState({ fetchAlertObj });
  }

  handleSaveError(error) {
    console.log('TCL: handleSaveError -> error', error);
    let status =
      error.response !== undefined
        ? error.response.status
        : error.request.status;
    const postAlertObj = configureAlert(status, this.clearPostAlert);

    this.setState({ postAlertObj });
  }

  handleSaveItClick = () => {
    let postData = { json: this.props.smData[0] };
    this.apiUtils
      .postRequest('structure.json', postData)
      .then(response => {
        const { status } = response;
        const postAlertObj = configureAlert(status, this.clearPostAlert);

        this.setState({ postAlertObj });
      })
      .catch(error => {
        this.handleSaveError(error);
      });
  };

  render() {
    const { smData = [], forms } = this.props;
    const { fetchAlertObj, postAlertObj } = this.state;

    return (
      <section className="structure-section">
        {postAlertObj && <AlertContainer {...postAlertObj} />}
        {!forms.structureRetrieved ? (
          <AlertContainer {...fetchAlertObj} />
        ) : (
          <div className="scrollable">
            <h3>HTML Structure Tree from a masterfile in server</h3>
            <br />
            <List items={smData} />
            <Row>
              <Col xs={12} className="text-right">
                <Button bsStyle="primary" onClick={this.handleSaveItClick}>
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

// For testing purposes
export { StructureOutputContainer as PureStructureOutputContainer };

const mapStateToProps = state => ({
  smData: state.smData,
  forms: state.forms
});

const mapDispatchToProps = dispatch => ({
  buildSMUI: smData => dispatch(buildSMUI(smData)),
  handleStructureFile: code => dispatch(handleStructureMasterFile(code))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(StructureOutputContainer);
