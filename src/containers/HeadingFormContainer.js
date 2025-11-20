import React from 'react';
import { useErrorBoundary } from 'react-error-boundary';
import PropTypes from 'prop-types';
import HeadingForm from '../components/HeadingForm';
import { useSelector } from 'react-redux';
import StructuralMetadataUtils from '../services/StructuralMetadataUtils';
import { useStructureUpdate } from '../services/sme-hooks';

const structuralMetadataUtils = new StructuralMetadataUtils();

const HeadingFormContainer = ({ cancelClick }) => {
  const { smData } = useSelector((state) => state.structuralMetadata);

  const { updateStructure } = useStructureUpdate();

  const { showBoundary } = useErrorBoundary();

  const submit = (values) => {
    try {
      let submittedItem = {
        headingChildOf: values.headingChildOf,
        headingTitle: values.headingTitle,
      };
      let updatedSmData = null;

      // Update the data structure with new heading
      updatedSmData = structuralMetadataUtils.insertNewHeader(submittedItem, smData);

      // Update redux store via custom hook
      updateStructure(updatedSmData);

      // Close the form
      cancelClick();
    } catch (error) {
      showBoundary(error);
    }
  };

  return (
    <HeadingForm
      onSubmit={submit}
      cancelClick={cancelClick}
    />
  );
};

HeadingFormContainer.propTypes = {
  cancelClick: PropTypes.func.isRequired,
};

export default HeadingFormContainer;
