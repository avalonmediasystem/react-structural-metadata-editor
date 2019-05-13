import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import TimespanInlineForm from './TimespanInlineForm';
import HeadingInlineForm from './HeadingInlineForm';
import { buildSMUI } from '../actions/sm-data';
import { cloneDeep } from 'lodash';
import StructuralMetadataUtils from '../services/StructuralMetadataUtils';

const structuralMetadataUtils = new StructuralMetadataUtils();

class ListItemEditForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isTyping: false,
      isInitializing: true
    };
  }

  static propTypes = {
    handleEditFormCancel: PropTypes.func,
    item: PropTypes.object.isRequired
  };

  // Toggle isTyping flag on and off from events in TimespanInlinForm
  setIsTyping = value => {
    if (value === 1) {
      this.setState({ isTyping: true });
    } else {
      this.setState({ isTyping: false });
    }
  };

  // Toggle isInitializing flag on and off from events in TimespanInlinForm
  setIsInitializing = value => {
    if (value === 1) {
      this.setState({ isInitializing: true });
    } else {
      this.setState({ isInitializing: false });
    }
  };

  addUpdatedValues(item, payload) {
    if (item.type === 'div' || item.type === 'root') {
      item.label = payload.headingTitle;
    } else if (item.type === 'span') {
      item.label = payload.timespanTitle;
      item.begin = payload.beginTime;
      item.end = payload.endTime;
    }
    return item;
  }

  handleCancelClick = e => {
    this.props.handleEditFormCancel();
  };

  handleSaveClick = (id, payload) => {
    // Clone smData
    let clonedItems = cloneDeep(this.props.smData);

    // Get the original item
    /* eslint-disable */
    let item = structuralMetadataUtils.findItem(id, clonedItems);
    /* eslint-enable */

    // Update item values
    item = this.addUpdatedValues(item, payload);

    // Send updated smData back to redux
    this.props.buildSMUI(clonedItems);

    // Turn off editing state
    this.props.handleEditFormCancel();
  };

  render() {
    const { item } = this.props;

    if (item.type === 'span') {
      return (
        <TimespanInlineForm
          item={item}
          cancelFn={this.handleCancelClick}
          saveFn={this.handleSaveClick}
          setIsTyping={this.setIsTyping}
          isTyping={this.state.isTyping}
          isInitializing={this.state.isInitializing}
          setIsInitializing={this.setIsInitializing}
        />
      );
    }

    if (item.type === 'div' || item.type === 'root') {
      return (
        <HeadingInlineForm
          item={item}
          cancelFn={this.handleCancelClick}
          saveFn={this.handleSaveClick}
        />
      );
    }
  }
}

const mapStateToProps = state => ({
  smData: state.smData
});

const mapDispathToProps = dispatch => ({
  buildSMUI: json => dispatch(buildSMUI(json))
});

export default connect(
  mapStateToProps,
  mapDispathToProps
)(ListItemEditForm);
