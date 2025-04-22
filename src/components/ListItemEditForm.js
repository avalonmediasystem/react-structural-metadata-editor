import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
<<<<<<< HEAD
import { useDispatch, useSelector } from 'react-redux';
=======
import { connect, useDispatch, useSelector } from 'react-redux';
>>>>>>> 44af1bc (Convert some of the form and listitem controls components to functional components)
import TimespanInlineForm from './TimespanInlineForm';
import HeadingInlineForm from './HeadingInlineForm';
import { reBuildSMUI } from '../actions/sm-data';
import { cloneDeep } from 'lodash';
import StructuralMetadataUtils from '../services/StructuralMetadataUtils';

const structuralMetadataUtils = new StructuralMetadataUtils();

const ListItemEditForm = ({ item, handleEditFormCancel }) => {
  // Dispatch actions to Redux store
  const dispatch = useDispatch();
  const updateSMUI = (cloned, duration) => dispatch(reBuildSMUI(cloned, duration));

  // Get state variables from Redux store
  const { smData } = useSelector((state) => state.structuralMetadata);
  const { duration } = useSelector((state) => state.peaksInstance);

  const [isTyping, _setIsTyping] = useState(false);
  const [isInitializing, _setIsInitializing] = useState(true);

  useEffect(() => {
    return () => {
      setIsTyping(false);
      setIsInitializing(true);
    };
  });

  // Toggle isTyping flag on and off from events in TimespanInlinForm
  const setIsTyping = (value) => {
    if (value === 1) {
      _setIsTyping(true);
    } else {
      _setIsTyping(false);
    }
  };

  // Toggle isInitializing flag on and off from events in TimespanInlinForm
  const setIsInitializing = (value) => {
    if (value === 1) {
      _setIsInitializing(true);
    } else {
      _setIsInitializing(false);
    }
  };


  const addUpdatedValues = (item, payload) => {
    if (item.type === 'div' || item.type === 'root') {
      item.label = payload.headingTitle;
    } else if (item.type === 'span') {
      item.label = payload.timespanTitle;
      item.begin = payload.beginTime;
      item.end = payload.endTime;
    }
    return item;
  };

  const handleCancelClick = (e) => {
    handleEditFormCancel();
  };

  const handleSaveClick = (id, payload) => {
    // Clone smData
    let clonedItems = cloneDeep(smData);

    // Get the original item
    /* eslint-disable */
    let item = structuralMetadataUtils.findItem(id, clonedItems);
    /* eslint-enable */

    // Update item values
    item = addUpdatedValues(item, payload);

    // Send updated smData back to redux
    updateSMUI(clonedItems, duration);

    // Turn off editing state
    handleEditFormCancel();
  };

  if (item.type === 'span') {
    return (
      <TimespanInlineForm
        item={item}
        cancelFn={handleCancelClick}
        saveFn={handleSaveClick}
        setIsTyping={setIsTyping}
        isTyping={isTyping}
        isInitializing={isInitializing}
        setIsInitializing={setIsInitializing}
      />
    );
  }

  if (item.type === 'div' || item.type === 'root') {
    return (
      <HeadingInlineForm
        itemId={item.id}
        cancelFn={handleCancelClick}
        saveFn={handleSaveClick}
      />
    );
  }
};

ListItemEditForm.propTypes = {
  item: PropTypes.object.isRequired,
  handleEditFormCancel: PropTypes.func
};

export default ListItemEditForm

