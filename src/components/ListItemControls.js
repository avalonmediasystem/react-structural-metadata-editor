import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import PopoverBody from 'react-bootstrap/PopoverBody';
import PopoverHeader from 'react-bootstrap/PopoverHeader';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { connect, useDispatch, useSelector } from 'react-redux';
import {
  handleEditingTimespans,
  updateStructureStatus,
} from '../actions/forms';
import { faPen, faTrash, faDotCircle } from '@fortawesome/free-solid-svg-icons';

const styles = {
  buttonToolbar: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  popover: {
    width: '250px',
    height: 'auto',
  },
};

const ListItemControls = ({ handleDelete, handleEditClick, handleShowDropTargetsClick, item }) => {
  // Dispatch actions to Redux store
  const dispatch = useDispatch();
  const updateEditingTimespans = (value) => dispatch(handleEditingTimespans(value));
  const updateStructStatus = (value) => dispatch(updateStructureStatus(value));

  // Get state variables from Redux store
  const { editingDisabled } = useSelector((state) => state.forms);

  const [deleteMessage, setDeleteMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const enableEditing = () => {
    // Enable editing of other list items
    updateEditingTimespans(0);
  };

  const handleConfirmDelete = () => {
    handleDelete();
    enableEditing();
    setDeleteMessage('');
    setShowDeleteConfirm(false);
    // Change structureIsSaved to false
    updateStructStatus(0);
  };

  const handleDeleteClick = (e) => {
    const { childrenCount, label } = item;
    let deleteMessage = `Are you sure you'd like to delete <strong>${label}</strong>`;

    if (childrenCount > 0) {
      const puralizedItem = childrenCount > 1 ? 'items' : 'item';
      deleteMessage += ` and it's <strong>${childrenCount}</strong> child ${puralizedItem}`;
    }
    deleteMessage += `?`;

    // Disable editing of other list items
    updateEditingTimespans(1);

    setDeleteMessage(deleteMessage);
    setShowDeleteConfirm(true);
  };

  const cancelDeleteClick = (e) => {
    enableEditing();
    setShowDeleteConfirm(false);
  };

  const popover = <Popover data-testid='delete-confirmation-popup'>
    <PopoverHeader as='h3'>Confirm delete?</PopoverHeader>
    <PopoverBody>
      <p
        dangerouslySetInnerHTML={{ __html: deleteMessage }}
        data-testid='delete-confirmation-message'
      />
      <ButtonToolbar style={styles.buttonToolbar}>
        <Button
          variant='danger'
          size='sm'
          onClick={handleConfirmDelete}
          data-testid='delete-confirmation-confirm-btn'
          className='mr-1'
        >
          Delete
        </Button>
        <Button
          size='sm'
          variant='outline-secondary'
          onClick={cancelDeleteClick}
          data-testid='delete-confirmation-cancel-btn'
        >
          Cancel
        </Button>
      </ButtonToolbar>
    </PopoverBody>
  </Popover>;

  return (
    <div className='edit-controls-wrapper' data-testid='list-item-controls'>
      {item.type === 'span' && (
        <Button
          variant='link'
          disabled={editingDisabled && !item.active}
          onClick={handleShowDropTargetsClick}
          data-testid='list-item-dnd-btn'
        >
          <FontAwesomeIcon icon={faDotCircle} />
        </Button>
      )}
      <Button
        variant='link'
        onClick={handleEditClick}
        disabled={editingDisabled}
        data-testid='list-item-edit-btn'
      >
        <FontAwesomeIcon icon={faPen} />
      </Button>

      {item.type !== 'root' && (
        <OverlayTrigger
          trigger='click'
          placement='left'
          show={showDeleteConfirm}
          overlay={popover}
        >
          <Button
            variant='link'
            onClick={handleDeleteClick}
            disabled={editingDisabled}
            data-testid='list-item-delete-btn'
          >
            <FontAwesomeIcon icon={faTrash} />
          </Button>
        </OverlayTrigger>
      )}
    </div>
  );
};

ListItemControls.propTypes = {
  handleDelete: PropTypes.func,
  handleEditClick: PropTypes.func,
  handleShowDropTargetsClick: PropTypes.func,
  item: PropTypes.shape({
    childrenCount: PropTypes.number,
    label: PropTypes.string.isRequired,
    type: PropTypes.string,
  }),
};

export default ListItemControls;
